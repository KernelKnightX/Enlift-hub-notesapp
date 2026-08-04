import { render, screen } from '@testing-library/react';
import SyllabusContent from '../components/resources/SyllabusContent';

describe('Public syllabus content', () => {
  test('renders the public syllabus overview and key paper list', () => {
    render(<SyllabusContent />);

    expect(screen.getByText(/UPSC Syllabus/i)).toBeTruthy();
    expect(screen.getByText(/General Studies Paper I/i)).toBeTruthy();
    expect(screen.getByText(/CSAT \(Paper II\)/i)).toBeTruthy();
  });
});
