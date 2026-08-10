export function createEmptySubjectForm() {
  return { name: '', description: '', order: 0 };
}

export function createEmptyBookForm() {
  return {
    title: '',
    description: '',
    url: '',
    coverFile: null,
    coverUrl: '',
    pages: '',
    subjectId: '',
    language: 'English',
    difficulty: 'Intermediate',
  };
}

export function buildSubjectPayload(form) {
  return {
    name: (form?.name || '').trim(),
    description: (form?.description || '').trim(),
    order: Number(form?.order) || 0,
  };
}

export function buildBookPayload(form) {
  return {
    title: (form?.title || '').trim(),
    description: (form?.description || '').trim(),
    url: (form?.url || '').trim(),
    coverUrl: (form?.coverUrl || '').trim(),
    pages: Number(form?.pages) || null,
    subjectId: (form?.subjectId || '').trim(),
    language: form?.language || 'English',
    difficulty: form?.difficulty || 'Intermediate',
  };
}
