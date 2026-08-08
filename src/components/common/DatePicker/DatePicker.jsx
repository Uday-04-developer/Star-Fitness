import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  formatDisplayDate,
  formatMonthTitle,
  getCalendarCells,
  getNearTermDateRange,
  getTodayIsoDate,
  isIsoDateInRange,
} from '@/utils/date';
import styles from './DatePicker.module.css';

const toParts = (iso) => {
  const [year, month, day] = String(iso).slice(0, 10).split('-').map(Number);
  return { year, month, day };
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DatePicker = ({
  label,
  name,
  value = '',
  onChange,
  error = '',
  required = false,
  min: minProp,
  max: maxProp,
  helperText = 'Choose today or up to 4 days ahead.',
}) => {
  const inputId = useId();
  const rootRef = useRef(null);
  const range = useMemo(() => {
    const defaults = getNearTermDateRange();
    return {
      min: minProp || defaults.min,
      max: maxProp || defaults.max,
    };
  }, [minProp, maxProp]);

  const initialMonth = toParts(value || range.min);
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);

  const todayIso = getTodayIsoDate();
  const cells = useMemo(
    () => getCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const shiftMonth = (delta) => {
    const next = new Date(Date.UTC(viewYear, viewMonth - 1 + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth() + 1);
  };

  const handleSelect = (isoDate) => {
    if (!isIsoDateInRange(isoDate, range.min, range.max)) {
      return;
    }

    onChange?.({
      target: {
        name,
        value: isoDate,
      },
    });
    setIsOpen(false);
  };

  const openPicker = () => {
    const focus = toParts(value || range.min);
    setViewYear(focus.year);
    setViewMonth(focus.month);
    setIsOpen((open) => !open);
  };

  return (
    <div className={styles.field} ref={rootRef}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required ? <span className={styles.required}>*</span> : null}
      </label>

      <button
        id={inputId}
        type="button"
        className={[styles.trigger, error ? styles.hasError : ''].filter(Boolean).join(' ')}
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
      >
        <span className={value ? styles.value : styles.placeholder}>
          {value ? formatDisplayDate(value) : 'Select date'}
        </span>
        <CalendarDays size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {/* Keep a hidden input so native form semantics / autofill stay available */}
      <input type="hidden" name={name} value={value} readOnly />

      {isOpen ? (
        <div className={styles.popover} role="dialog" aria-label={label}>
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <p className={styles.monthTitle}>
              {formatMonthTitle(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.weekdays} aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day} className={styles.weekday}>
                {day}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map((isoDate, index) => {
              if (!isoDate) {
                return <span key={`empty-${index}`} className={styles.empty} />;
              }

              const enabled = isIsoDateInRange(isoDate, range.min, range.max);
              const isSelected = isoDate === value;
              const isToday = isoDate === todayIso;
              const dayNum = toParts(isoDate).day;

              return (
                <button
                  key={isoDate}
                  type="button"
                  className={[
                    styles.day,
                    enabled ? styles.dayEnabled : styles.dayDisabled,
                    isSelected ? styles.daySelected : '',
                    isToday && !isSelected ? styles.dayToday : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!enabled}
                  onClick={() => handleSelect(isoDate)}
                  aria-label={formatDisplayDate(isoDate)}
                  aria-pressed={isSelected}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <p className={styles.rangeHint}>
            Allowed: {formatDisplayDate(range.min)} – {formatDisplayDate(range.max)}
          </p>
        </div>
      ) : null}

      {helperText && !error ? (
        <p id={`${inputId}-hint`} className={styles.hint}>
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default DatePicker;
