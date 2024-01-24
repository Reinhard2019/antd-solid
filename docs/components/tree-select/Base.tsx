import { type Component } from 'solid-js'
import { TreeSelect } from 'antd-solid'

const options = [
  {
    title: 'Rubber Soul',
    children: [
      {
        title: "Everybody's Got Something to Hide Except Me and My Monkey",
      },
      {
        title: 'Drive My Car',
        disabled: true,
      },
      {
        title: 'Norwegian Wood',
      },
      {
        title: "You Won't See",
        disabled: true,
      },
      {
        title: 'Nowhere Man',
      },
      {
        title: 'Think For Yourself',
      },
      {
        title: 'The Word',
      },
      {
        title: 'Michelle',
        disabled: true,
      },
      {
        title: 'What goes on',
      },
      {
        title: 'Girl',
      },
      {
        title: "I'm looking through you",
      },
      {
        title: 'In My Life',
      },
      {
        title: 'Wait',
      },
    ],
  },
  {
    title: 'Let It Be',
    children: [
      {
        title: 'Two Of Us',
      },
      {
        title: 'Dig A Pony',
      },
      {
        title: 'Across The Universe',
      },
      {
        title: 'I Me Mine',
      },
      {
        title: 'Dig It',
      },
      {
        title: 'Let It Be',
      },
      {
        title: 'Maggie Mae',
      },
      {
        title: "I've Got A Feeling",
      },
      {
        title: 'One After 909',
      },
      {
        title: 'The Long And Winding Road',
      },
      {
        title: 'For You Blue',
      },
      {
        title: 'Get Back',
      },
    ],
  },
]

const Base: Component = () => {
  return <TreeSelect placeholder="请选择" treeData={options} multiple allowClear />
}

export default Base
