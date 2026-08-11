import JSZip from 'jszip';
import { supabase } from '@/lib/supabaseClient';
import { getTodayIsoDate } from '@/utils/date';
import { buildCsv } from '@/utils/csv';
import { createSelfieSignedUrl } from '@/utils/selfie';

const MEMBER_CSV_COLUMNS = [
  'id',
  'full_name',
  'phone_number',
  'email',
  'gender',
  'date_of_birth',
  'address',
  'selfie_url',
  'selfie_export_file',
  'plan_type',
  'plan_duration_days',
  'plan_start_date',
  'paid_duration_months',
  'current_period_end',
  'plan_amount',
  'payment_status',
  'notes',
  'created_at',
  'updated_at',
];

const SELFIE_CONCURRENCY = 4;
const SIGNED_URL_TTL_SECONDS = 120;

export class BackupExportError extends Error {
  constructor(message, code = 'backup_failed') {
    super(message);
    this.name = 'BackupExportError';
    this.code = code;
  }
}

const parseInvokeFailure = async (error, data) => {
  let body = data && typeof data === 'object' ? data : null;
  let status = null;

  try {
    if (error?.context?.status) {
      status = error.context.status;
    }
    if (!body && error?.context && typeof error.context.json === 'function') {
      body = await error.context.json();
    }
  } catch {
    // keep defaults
  }

  const code = body?.code ? String(body.code) : '';

  if (status === 401 || code === 'unauthorized') {
    return new BackupExportError(
      'Your session expired. Please sign in again and retry.',
      'unauthorized',
    );
  }

  if (status === 403 || code === 'forbidden') {
    return new BackupExportError(
      'You are not authorized to export backups.',
      'forbidden',
    );
  }

  return new BackupExportError(
    'Backup could not be prepared. Please try again.',
    'prepare_failed',
  );
};

const fetchExportPayload = async () => {
  if (!supabase) {
    throw new BackupExportError(
      'Backup could not be prepared. Please try again.',
      'not_configured',
    );
  }

  const { data, error } = await supabase.functions.invoke(
    'export-members-backup',
    { body: {} },
  );

  if (error) {
    throw await parseInvokeFailure(error, data);
  }

  if (!data?.ok || !Array.isArray(data.members)) {
    throw new BackupExportError(
      'Backup could not be prepared. Please try again.',
      'invalid_response',
    );
  }

  return data;
};

const runPool = async (items, concurrency, worker) => {
  if (!items.length) {
    return;
  }

  let index = 0;
  const limit = Math.min(concurrency, items.length);

  const run = async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      await worker(items[current], current);
    }
  };

  await Promise.all(Array.from({ length: limit }, () => run()));
};

const downloadSelfieBlob = async (selfieUrl) => {
  const signedUrl = await createSelfieSignedUrl(
    selfieUrl,
    SIGNED_URL_TTL_SECONDS,
  );
  if (!signedUrl) {
    return null;
  }

  const response = await fetch(signedUrl);
  if (!response.ok) {
    return null;
  }

  return response.blob();
};

const buildReadme = ({
  backupDate,
  memberCount,
  selfiesDownloaded,
  selfiesMissing,
}) =>
  [
    'Star Fitness Backup',
    '===================',
    '',
    `Backup date: ${backupDate}`,
    `Members exported: ${memberCount}`,
    `Selfies downloaded: ${selfiesDownloaded}`,
    `Selfies missing: ${selfiesMissing}`,
    '',
    'This backup contains sensitive member personal information and photographs.',
    'Keep this file secure.',
    'Do not upload or share it publicly.',
    '',
    'Files:',
    '- members.csv — member data',
    '- manifest.json — backup summary and selfie status',
    '- selfies/ — member photographs mapped by member ID (when available)',
    '',
    'The selfie filename corresponds to the `id` column in members.csv.',
    '',
    selfiesMissing > 0
      ? 'Note: some selfies were missing or could not be downloaded. This file is not a complete photo archive.'
      : 'All expected selfies were included when this backup was created.',
    '',
  ].join('\n');

const triggerBrowserDownload = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/**
 * Owner backup: Edge Function metadata → CSV + signed selfie fetch → browser ZIP.
 * @param {{ onProgress?: (state: { phase: string, message: string, current?: number, total?: number }) => void, signal?: { cancelled: boolean } }} options
 */
export const downloadMembersBackup = async ({ onProgress, signal } = {}) => {
  const assertNotCancelled = () => {
    if (signal?.cancelled) {
      throw new BackupExportError('Backup cancelled.', 'cancelled');
    }
  };

  onProgress?.({
    phase: 'preparing',
    message: 'Preparing backup...',
  });

  assertNotCancelled();
  const payload = await fetchExportPayload();
  assertNotCancelled();

  onProgress?.({
    phase: 'members',
    message: 'Preparing member data...',
  });

  const backupDate = getTodayIsoDate();
  const folderName = `star-fitness-backup-${backupDate}`;
  const zipFileName = `${folderName}.zip`;
  const members = payload.members;
  const serverManifest = payload.manifest || {};

  const csv = buildCsv(members, MEMBER_CSV_COLUMNS);

  const candidates = members.filter((member) => member?.selfie_available);
  const downloadedIds = [];
  const downloadFailures = [];

  const zip = new JSZip();
  const root = zip.folder(folderName);
  if (!root) {
    throw new BackupExportError(
      'Backup could not be prepared. Please try again.',
      'zip_failed',
    );
  }

  root.file('members.csv', csv);

  let completed = 0;
  const totalPhotos = candidates.length;

  if (totalPhotos > 0) {
    onProgress?.({
      phase: 'photos',
      message: `Downloading photos 0 / ${totalPhotos}...`,
      current: 0,
      total: totalPhotos,
    });

    const selfiesFolder = root.folder('selfies');

    await runPool(candidates, SELFIE_CONCURRENCY, async (member) => {
      assertNotCancelled();

      const memberId = String(member.id || '');
      try {
        const blob = await downloadSelfieBlob(member.selfie_url);
        if (!blob || !memberId) {
          downloadFailures.push({
            member_id: memberId,
            reason: 'download_failed',
          });
        } else {
          selfiesFolder.file(`${memberId}.jpg`, blob);
          downloadedIds.push(memberId);
        }
      } catch (error) {
        console.error(error);
        downloadFailures.push({
          member_id: memberId,
          reason: 'download_failed',
        });
      } finally {
        completed += 1;
        onProgress?.({
          phase: 'photos',
          message: `Downloading photos ${completed} / ${totalPhotos}...`,
          current: completed,
          total: totalPhotos,
        });
      }
    });
  }

  assertNotCancelled();

  const serverMissing = Array.isArray(serverManifest.missing_selfies)
    ? serverManifest.missing_selfies
    : [];

  const missingSelfies = [...serverMissing, ...downloadFailures];
  const selfieDownloaded = downloadedIds.length;
  const selfieDownloadFailed = downloadFailures.length;
  const selfieMissing = missingSelfies.length;

  const manifest = {
    version: 1,
    generated_at: serverManifest.generated_at || new Date().toISOString(),
    backup_date: backupDate,
    member_count: members.length,
    selfie_expected: Number(serverManifest.selfie_expected) || candidates.length,
    selfie_available: Number(serverManifest.selfie_available) || candidates.length,
    selfie_downloaded: selfieDownloaded,
    selfie_download_failed: selfieDownloadFailed,
    selfie_missing: selfieMissing,
    missing_selfies: missingSelfies,
  };

  root.file('manifest.json', JSON.stringify(manifest, null, 2));
  root.file(
    'README.txt',
    buildReadme({
      backupDate,
      memberCount: members.length,
      selfiesDownloaded: selfieDownloaded,
      selfiesMissing: selfieMissing,
    }),
  );

  onProgress?.({
    phase: 'zipping',
    message: 'Creating backup...',
  });

  assertNotCancelled();
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  assertNotCancelled();

  triggerBrowserDownload(zipBlob, zipFileName);

  const summary = {
    backupDate,
    zipFileName,
    memberCount: members.length,
    selfieDownloaded,
    selfieMissing,
    selfieDownloadFailed,
  };

  onProgress?.({
    phase: 'done',
    message:
      selfieMissing > 0
        ? `Backup completed with ${selfieMissing} missing photo${selfieMissing === 1 ? '' : 's'}.`
        : 'Backup complete.',
  });

  return summary;
};
