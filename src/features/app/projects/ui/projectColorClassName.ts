/*
 * Projects don't store a color, so we derive a stable one from the id to tell them apart.
 * Red and green are left out on purpose: they mark overdue and today's tasks.
 */
const projectColorClassNames = [
  'bg-sky-500',
  'bg-violet-500',
  'bg-amber-400',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-indigo-500',
  'bg-lime-500',
  'bg-fuchsia-500',
  'bg-cyan-500',
];

export const getProjectColorClassName = (projectId: string) => {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash * 31 + projectId.charCodeAt(i)) | 0;
  }

  return projectColorClassNames[Math.abs(hash) % projectColorClassNames.length];
};
