import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders logixboard logo', () => {
  render(<App />);
  const linkElement = screen.getByAltText('Logixboard Logo');
  expect(linkElement).toBeInTheDocument();
});
