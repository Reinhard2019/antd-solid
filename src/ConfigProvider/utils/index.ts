import { nanoid } from 'nanoid'
import { TinyColor } from '@ctrl/tinycolor'
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
    // ============== Background ============== //
    colorFillContent: mapToken.colorFillSecondary,
    colorFillContentHover: mapToken.colorFill,
    colorFillAlter: mapToken.colorFillQuaternary,
    colorBgContainerDisabled: mapToken.colorFillTertiary,

    // ============== Split ============== //
    colorBorderBg: mapToken.colorBgContainer,
    colorSplit: getAlphaColor(mapToken.colorBorderSecondary, mapToken.colorBgContainer),

    // ============== Text ============== //
    colorTextPlaceholder: mapToken.colorTextQuaternary,
    colorTextDisabled: mapToken.colorTextQuaternary,
    colorTextHeading: mapToken.colorText,
    colorTextLabel: mapToken.colorTextSecondary,
    colorTextDescription: mapToken.colorTextTertiary,
    colorTextLightSolid: mapToken.colorWhite,
    colorHighlight: mapToken.colorError,
    colorBgTextHover: mapToken.colorFillSecondary,
    colorBgTextActive: mapToken.colorFill,

    colorIcon: mapToken.colorTextTertiary,
    colorIconHover: mapToken.colorText,

    colorErrorOutline: getAlphaColor(mapToken.colorErrorBg, mapToken.colorBgContainer),
    colorWarningOutline: getAlphaColor(mapToken.colorWarningBg, mapToken.colorBgContainer),

    controlItemBgHover: mapToken.colorFillTertiary,
    controlItemBgActive: mapToken.colorPrimaryBg,
    controlItemBgActiveHover: mapToken.colorPrimaryBgHover,
    controlItemBgActiveDisabled: mapToken.colorFill,
    controlTmpOutline: mapToken.colorFillQuaternary,
    controlOutline: getAlphaColor(mapToken.colorPrimaryBg, mapToken.colorBgContainer),

    fontWeightStrong: 600,

    opacityLoading: 0.65,

    linkDecoration: 'none',
    linkHoverDecoration: 'none',
    linkFocusDecoration: 'none',

    controlPaddingHorizontal: 12,
    controlPaddingHorizontalSM: 8,
  }

  const colorFillAlterSolid = new TinyColor(aliasToken.colorFillAlter)
    .onBackground(mapToken.colorBgContainer)
    .toHexShortString()

  return {
    '--ant-color-primary': mapToken.colorPrimary,
    '--ant-color-primary-active': mapToken.colorPrimaryActive,
    '--ant-color-primary-hover': mapToken.colorPrimaryHover,
    '--ant-color-primary-border': mapToken.colorPrimaryBorder,
    '--ant-color-primary-border-hover': mapToken.colorPrimaryBorderHover,

    '--ant-color-success': mapToken.colorSuccess,
    '--ant-color-success-border': mapToken.colorSuccessBorder,
    '--ant-color-success-bg': mapToken.colorSuccessBg,

    '--ant-color-error': mapToken.colorError,
    '--ant-color-error-active': mapToken.colorErrorActive,
    '--ant-color-error-bg': mapToken.colorErrorBg,
    '--ant-color-error-bg-hover': mapToken.colorErrorBgHover,
    '--ant-color-error-border': mapToken.colorErrorBorder,
    '--ant-color-error-border-hover': mapToken.colorErrorBorderHover,

    '--ant-color-warning': mapToken.colorWarning,
    '--ant-color-warning-bg': mapToken.colorWarningBg,
    '--ant-color-warning-bg-hover': mapToken.colorWarningBgHover,
    '--ant-color-warning-border': mapToken.colorWarningBorder,
    '--ant-color-warning-border-hover': mapToken.colorWarningBorderHover,

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
    '--ant-color-text-label': aliasToken.colorTextLabel,
    '--ant-color-text-description': aliasToken.colorTextDescription,
    '--ant-color-text-placeholder': aliasToken.colorTextPlaceholder,
    '--ant-color-text-light-solid': aliasToken.colorTextLightSolid,

    '--ant-color-bg-text-hover': aliasToken.colorBgTextHover,
    '--ant-color-bg-text-active': aliasToken.colorBgTextActive,
    '--ant-color-bg-container': mapToken.colorBgContainer,
    '--ant-color-bg-elevated': mapToken.colorBgElevated,
    '--ant-color-bg-container-disabled': aliasToken.colorBgContainerDisabled,
    '--ant-color-bg-container-secondary': mapToken.colorBgContainerSecondary,
    '--ant-color-bg-container-tertiary': mapToken.colorBgContainerTertiary,
    '--ant-color-bg-spotlight': mapToken.colorBgSpotlight,
    '--ant-color-bg-layout': mapToken.colorBgLayout,

    '--ant-color-white': mapToken.colorWhite,
    '--ant-color-bg-mask': mapToken.colorBgMask,

    '--ant-color-fill': mapToken.colorFill,
    '--ant-color-fill-secondary': mapToken.colorFillSecondary,
    '--ant-color-fill-tertiary': mapToken.colorFillTertiary,
    '--ant-color-fill-quaternary': mapToken.colorFillQuaternary,

    '--ant-control-outline': aliasToken.controlOutline,
    '--ant-control-item-bg-active': aliasToken.controlItemBgActive,
    '--ant-control-item-bg-hover': mapToken.colorFillTertiary,

    '--ant-font-weight-strong': '600',

    '--ant-font-size-sm': '12px',
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

    '--ant-opacity-loading': '0.65',

    '--ant-button-default-color': mapToken.colorText,
    '--ant-button-border-color-disabled': mapToken.colorBorder,
    '--ant-button-default-bg': mapToken.colorBgContainer,

    '--ant-radio-dot-color-disabled': aliasToken.colorTextDisabled,
    '--ant-radio-button-checked-bg-disabled': aliasToken.controlItemBgActiveDisabled,

    '--ant-collapse-header-bg': aliasToken.colorFillAlter,

    '--ant-select-option-selected-bg': aliasToken.controlItemBgActive,
    '--ant-select-option-active-bg': aliasToken.controlItemBgHover,
    '--ant-select-multiple-item-bg': mapToken.colorFillSecondary,

    '--ant-tree-expand-icon-width': '24px',
    '--ant-tree-node-wrapper-padding': '2px 0',
    '--ant-tree-node-selected-bg': aliasToken.controlItemBgActive,
    '--ant-tree-node-hover-bg': aliasToken.controlItemBgHover,

    '--ant-alert-default-padding': '8px 12px',

    '--ant-tabs-card-bg': aliasToken.colorFillAlter,

    '--ant-progress-remaining-color': mapToken.colorFillSecondary,

    '--ant-segmented-item-color': aliasToken.colorTextLabel,
    '--ant-segmented-item-hover-color': mapToken.colorText,
    '--ant-segmented-item-selected-color': mapToken.colorText,
    '--ant-segmented-item-selected-bg': mapToken.colorBgContainerSecondary,
    '--ant-segmented-item-hover-bg': mapToken.colorFillSecondary,
    '--ant-segmented-item-active-bg': mapToken.colorFill,

    '--ant-table-header-bg': colorFillAlterSolid,
    '--ant-table-row-hover-bg': colorFillAlterSolid,
    '--ant-table-border-color': mapToken.colorBorderSecondary,

    '--ant-slider-handle-color': mapToken.colorPrimaryBorder,
    '--ant-slider-handle-active-color': mapToken.colorPrimary,
    '--ant-slider-handle-color-disabled': new TinyColor(aliasToken.colorTextDisabled)
      .onBackground(mapToken.colorBgContainer)
      .toHexShortString(),
    '--ant-slider-track-bg-disabled': aliasToken.colorBgContainerDisabled,

    '--ant-modal-title-color': aliasToken.colorTextHeading,
  }
}

export function getCssVariablesClass() {
  return `css-var-${nanoid(12)}`
}
