import ReactSlider from 'react-slider'

import styles from './marked-slider-range.module.css'

type MarkedSliderRangeProps = {
  value: number
  onChange: (value: number) => void
  marks: number[]
  min?: number
  max?: number
  step?: number
}

export const MarkedSliderRange = ({ min, max, step, value, marks, onChange }: MarkedSliderRangeProps) => (
  <div className={styles.sliderWrapper}>
    <ReactSlider
      className={styles.slider}
      markClassName={styles.sliderMark}
      marks={marks}
      max={max}
      min={min}
      step={step}
      thumbClassName={styles.sliderThumb}
      trackClassName='sliderTrack'
      value={value}
      onChange={onChange}
    />
  </div>
)
