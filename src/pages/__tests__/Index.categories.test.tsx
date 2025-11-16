import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Index from '../Index'

describe('Index categories', () => {
  it('renders category buttons and toggles active state', async () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <Index />
        </BrowserRouter>
      </ThemeProvider>
    )

    const fantasy = await screen.findByTestId('category-Fantasy')
    expect(fantasy).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(fantasy)
    expect(fantasy).toHaveAttribute('aria-pressed', 'true')
  })
})
