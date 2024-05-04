import { type SeedToken, type CssVariables } from '../types'
import genDarkColorMapToken from '../dark'
import genLightColorMapToken from '../light'
import getAlphaColor from './getAlphaColor'

export function createCssVariables(
  token: SeedToken,
  theme: 'light' | 'dark' = 'light',
): CssVariables {
  const mapToken = theme === 'dark' ? genDarkColorMapToken(token) : genLightColorMapToken(token)

  const aliasToken = {
    colorTextPlaceholder: mapToken.colorTextQuaternary,
    colorTextDisabled: mapToken.colorTextQuaternary,
    colorTextHeading: mapToken.colorText,

    colorBgTextHover: mapToken.colorFillSecondary,
    colorBgTextActive: mapToken.colorFill,
    colorBgContainerDisabled: mapToken.colorFillTertiary,

    colorSplit: getAlphaColor(mapToken.colorBorderSecondary, mapToken.colorBgContainer),
    colorIcon: mapToken.colorTextTertiary,
    colorIconHover: mapToken.colorText,

    controlItemBgHover: mapToken.colorFillTertiary,
    controlItemBgActive: mapToken.colorPrimaryBg,
    controlItemBgActiveHover: mapToken.colorPrimaryBgHover,
    controlItemBgActiveDisabled: mapToken.colorFill,
    controlTmpOutline: mapToken.colorFillQuaternary,
    controlOutline: getAlphaColor(mapToken.colorPrimaryBg, mapToken.colorBgContainer),
  }

  return {
    '--ant-color-primary': mapToken.colorPrimary,
    '--ant-color-primary-active': mapToken.colorPrimaryActive,
    '--ant-color-primary-hover': mapToken.colorPrimaryHover,
    '--ant-color-primary-border': mapToken.colorPrimaryBorder,

    '--ant-color-success': mapToken.colorSuccess,
    '--ant-color-success-border': mapToken.colorSuccessBorder,
    '--ant-color-success-bg': mapToken.colorSuccessBg,

    '--ant-color-error': mapToken.colorError,
    '--ant-color-error-bg': mapToken.colorErrorBg,
    '--ant-color-error-border': mapToken.colorErrorBorder,
    '--ant-color-error-border-hover': mapToken.colorErrorBorderHover,
    '--ant-color-error-active': mapToken.colorErrorActive,

    '--ant-color-warning': mapToken.colorWarning,
    '--ant-color-warning-border': mapToken.colorWarningBorder,
    '--ant-color-warning-border-hover': mapToken.colorWarningBorderHover,
    '--ant-color-warning-bg': mapToken.colorWarningBg,

    '--ant-color-info-bg': mapToken.colorInfoBg,
    '--ant-color-info-border': mapToken.colorInfoBorder,

    '--ant-color-border': mapToken.colorBorder,
    '--ant-color-border-secondary': mapToken.colorBorderSecondary,
    '--ant-color-split': aliasToken.colorSplit,
    '--ant-color-icon': aliasToken.colorIcon,
    '--ant-color-icon-hover': aliasToken.colorIconHover,
    '--ant-color-text': mapToken.colorText,
    '--ant-color-text-secondary': mapToken.colorTextSecondary,
    '--ant-color-text-tertiary': mapToken.colorTextTertiary,
    '--ant-color-text-quaternary': mapToken.colorTextQuaternary,
    '--ant-color-text-disabled': aliasToken.colorTextDisabled,
    '--ant-color-text-heading': aliasToken.colorTextHeading,
    '--ant-color-text-placeholder': aliasToken.colorTextPlaceholder,
    '--ant-color-bg-text-hover': aliasToken.colorBgTextHover,
    '--ant-color-bg-text-active': aliasToken.colorBgTextActive,
    '--ant-color-bg-container': mapToken.colorBgContainer,
    '--ant-color-bg-container-disabled': aliasToken.colorBgContainerDisabled,
    '--ant-color-bg-elevated': mapToken.colorBgElevated,
    '--ant-color-bg-layout': mapToken.colorBgLayout,

    '--ant-color-white': mapToken.colorWhite,
    '--ant-color-bg-mask': mapToken.colorBgMask,

    '--ant-control-outline': aliasToken.controlOutline,
    '--ant-control-item-bg-active': aliasToken.controlItemBgActive,

    '--ant-font-weight-strong': '600',

    '--ant-font-size': '14px',
    '--ant-font-size-lg': '16px',

    '--ant-line-height': '1.5714285714285714',
    '--ant-line-height-lg': '1.5',
    '--ant-line-width-bold': '2px',
    '--ant-line-width': '1px',
    '--ant-line-type': 'solid',

    '--ant-margin-xxs': '4px',
    '--ant-margin-xs': '8px',
    '--ant-margin-sm': '12px',
    '--ant-margin': '16px',
    '--ant-margin-lg': '24px',
    '--ant-margin-xl': '32px',

    '--ant-padding-xxs': '4px',
    '--ant-padding-xs': '8px',
    '--ant-padding-sm': '12px',
    '--ant-padding': '16px',
    '--ant-padding-lg': '24px',
    '--ant-padding-xl': '32px',

    '--ant-box-shadow': `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
    '--ant-box-shadow-secondary': `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
    '--ant-box-shadow-tertiary':
      '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',

    '--ant-border-radius-xs': '2px',
    '--ant-border-radius-sm': '4px',
    '--ant-border-radius': '6px',
    '--ant-border-radius-lg': '8px',

    '--ant-button-default-color': mapToken.colorText,
    '--ant-button-border-color-disabled': mapToken.colorBorder,
    '--ant-button-default-bg': mapToken.colorBgContainer,

    '--ant-radio-dot-color-disabled': 'rgba(0, 0, 0, 0.25)',
    '--ant-radio-button-checked-bg-disabled': 'rgba(0, 0, 0, 0.15)',

    '--ant-collapse-header-bg': 'rgba(0, 0, 0, 0.02)',
    '--ant-collapse-header-padding': '12px 16px',
    '--ant-collapse-content-padding': '16px',

    '--ant-select-option-selected-bg': '#e6f4ff',
    '--ant-select-option-active-bg': 'rgba(0, 0, 0, 0.04)',
    '--ant-select-multiple-item-bg': 'rgba(0, 0, 0, 0.06)',
    '--ant-select-multiple-item-height': '24px',

    '--ant-tree-expand-icon-width': '24px',
    '--ant-tree-node-wrapper-padding': '2px 0',
    '--ant-tree-node-selected-bg': aliasToken.controlItemBgActive,
    '--ant-tree-node-hover-bg': aliasToken.controlItemBgHover,

    '--ant-alert-default-padding': '8px 12px',

    '--ant-tabs-card-bg': 'rgba(0, 0, 0, 0.02)',

    '--ant-progress-remaining-color': 'rgba(0, 0, 0, 0.06)',

    '--ant-segmented-item-color': 'rgba(0, 0, 0, 0.65)',
    '--ant-segmented-item-hover-bg': 'rgba(0, 0, 0, 0.06)',
    '--ant-segmented-item-active-bg': 'rgba(0, 0, 0, 0.15)',

    '--ant-table-header-bg': '#fafafa',
    '--ant-table-row-hover-bg': '#fafafa',
    '--ant-table-border-color': '#f0f0f0',

    '--ant-slider-rail-bg': 'rgba(0, 0, 0, 0.04)',
    '--ant-slider-rail-hover-bg': 'rgba(0, 0, 0, 0.06)',
    '--ant-slider-track-bg': '#91caff',
    '--ant-slider-track-hover-bg': '#69b1ff',
    '--ant-slider-handle-color': '#91caff',
    '--ant-slider-handle-active-color': '#1677ff',
    '--ant-slider-handle-color-disabled': '#bfbfbf',
    '--ant-slider-track-bg-disabled': 'rgba(0, 0, 0, 0.04)',

    '--ant-modal-content-bg': mapToken.colorBgElevated,
    '--ant-modal-title-color': aliasToken.colorTextHeading,
  }
}
