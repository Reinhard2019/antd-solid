import { type Component } from 'solid-js'
import { TreeSelect } from 'antd-solid'

const options = [
  {
    label: 'Rubber Soul',
    value: 'Rubber Soul',
    children: [
      {
        label: "Everybody's Got Something to Hide Except Me and My Monkey",
        value: "Everybody's Got Something to Hide Except Me and My Monkey",
      },
      {
        label: 'Drive My Car',
        value: 'Drive My Car',
        disabled: true,
      },
      {
        label: 'Norwegian Wood',
        value: 'Norwegian Wood',
      },
      {
        label: "You Won't See",
        value: "You Won't See",
        disabled: true,
      },
      {
        label: 'Nowhere Man',
        value: 'Nowhere Man',
      },
      {
        label: 'Think For Yourself',
        value: 'Think For Yourself',
      },
      {
        label: 'The Word',
        value: 'The Word',
      },
      {
        label: 'Michelle',
        value: 'Michelle',
        disabled: true,
      },
      {
        label: 'What goes on',
        value: 'What goes on',
      },
      {
        label: 'Girl',
        value: 'Girl',
      },
      {
        label: "I'm looking through you",
        value: "I'm looking through you",
      },
      {
        label: 'In My Life',
        value: 'In My Life',
      },
      {
        label: 'Wait',
        value: 'Wait',
      },
    ],
  },
  {
    label: 'Let It Be',
    value: 'Let It Be Album',
    children: [
      {
        label: 'Two Of Us',
        value: 'Two Of Us',
      },
      {
        label: 'Dig A Pony',
        value: 'Dig A Pony',
      },
      {
        label: 'Across The Universe',
        value: 'Across The Universe',
      },
      {
        label: 'I Me Mine',
        value: 'I Me Mine',
      },
      {
        label: 'Dig It',
        value: 'Dig It',
      },
      {
        label: 'Let It Be',
        value: 'Let It Be',
      },
      {
        label: 'Maggie Mae',
        value: 'Maggie Mae',
      },
      {
        label: "I've Got A Feeling",
        value: "I've Got A Feeling",
      },
      {
        label: 'One After 909',
        value: 'One After 909',
      },
      {
        label: 'The Long And Winding Road',
        value: 'The Long And Winding Road',
      },
      {
        label: 'For You Blue',
        value: 'For You Blue',
      },
      {
        label: 'Get Back',
        value: 'Get Back',
      },
    ],
  },
]

const Base: Component = () => {
  return <TreeSelect placeholder="请选择" treeData={options} multiple allowClear />
}

export default Base