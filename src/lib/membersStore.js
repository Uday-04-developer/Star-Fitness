import { INITIAL_MOCK_MEMBERS } from '@/lib/mockMembers';

let members = INITIAL_MOCK_MEMBERS.map((member) => ({ ...member }));
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const getMembers = () => members;

export const getMemberById = (id) => members.find((member) => member.id === id) || null;

export const deleteMemberById = (id) => {
  const next = members.filter((member) => member.id !== id);
  const changed = next.length !== members.length;
  members = next;
  if (changed) {
    notify();
  }
  return changed;
};

export const addMember = (member) => {
  members = [member, ...members];
  notify();
  return member;
};

export const subscribeMembers = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
