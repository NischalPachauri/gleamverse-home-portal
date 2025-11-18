import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Index from '../Index'

describe('Browsing section theme and accessibility', () => {
  it('renders category grid with accessible buttons', async () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Index />
        </BrowserRouter>
      </ThemeProvider>
    )

    const category = await screen.findByTestId('category-Fantasy')
    expect(category).toBeInTheDocument()
    expect(category).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders Continue Your Journey header', async () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Index />
        </BrowserRouter>
      </ThemeProvider>
    )

    const header = await screen.findByText(/Continue Your Journey/i)
    expect(header).toBeInTheDocument()
  })

  // Theme toggling behavior is verified in e2e visual tests
})
