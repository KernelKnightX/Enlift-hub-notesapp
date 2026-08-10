import { buildBookPayload, buildSubjectPayload, createEmptyBookForm, createEmptySubjectForm } from '../utils/adminBooks';

describe('admin books form helpers', () => {
  it('creates empty subject and book forms with sensible defaults', () => {
    expect(createEmptySubjectForm()).toEqual({ name: '', description: '', order: 0 });
    expect(createEmptyBookForm()).toEqual({
      title: '',
      description: '',
      url: '',
      coverFile: null,
      coverUrl: '',
      pages: '',
      subjectId: '',
      language: 'English',
      difficulty: 'Intermediate',
    });
  });

  it('builds trimmed payloads for subject and book submissions', () => {
    const subjectPayload = buildSubjectPayload({
      name: '  Polity  ',
      description: '  Indian Constitution  ',
      order: '4',
    });

    const bookPayload = buildBookPayload({
      title: '  Indian Polity  ',
      description: '  Full book  ',
      url: ' https://example.com/pdf ',
      coverUrl: 'https://example.com/cover.jpg',
      pages: '320',
      subjectId: 'subject-1',
      language: 'Hindi',
      difficulty: 'Advanced',
    });

    expect(subjectPayload).toEqual({
      name: 'Polity',
      description: 'Indian Constitution',
      order: 4,
    });

    expect(bookPayload).toEqual({
      title: 'Indian Polity',
      description: 'Full book',
      url: 'https://example.com/pdf',
      coverUrl: 'https://example.com/cover.jpg',
      pages: 320,
      subjectId: 'subject-1',
      language: 'Hindi',
      difficulty: 'Advanced',
    });
  });
});
