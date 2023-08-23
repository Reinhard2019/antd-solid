import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@solidjs/testing-library'
import InputNumber from './InputNumber'
import '@testing-library/jest-dom'

describe('InputNumber component', () => {
  it('onChange', () => {
    const onChange = vi.fn()
    const { getByPlaceholderText } = render(() => (
      <InputNumber placeholder="input-number" onChange={onChange} />
    ))

    const input: HTMLInputElement = getByPlaceholderText('input-number')
    input.value = '123'
    fireEvent.input(input)
    expect(onChange).toHaveBeenLastCalledWith(123)

    input.value = '1234'
    fireEvent.input(input)
    expect(onChange).toBeCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith(1234)

    input.value = '1234'
    fireEvent.input(input)
    expect(onChange).toBeCalledTimes(2)

    input.value = '1234.'
    fireEvent.input(input)
    expect(onChange).toBeCalledTimes(2)

    input.value = '1234.0'
    fireEvent.input(input)
    expect(onChange).toBeCalledTimes(2)

    input.value = '1234.01'
    fireEvent.input(input)
    expect(onChange).toBeCalledTimes(3)

    input.value = '123x'
    fireEvent.input(input)
    expect(onChange).toBeCalledTimes(3)

    fireEvent.blur(input)
    expect(onChange).toBeCalledTimes(3)
  })
})
