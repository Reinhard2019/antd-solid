import 'uno.css';
import { delegateEvents, use, insert, createComponent, effect, className, style, template, mergeProps as mergeProps$1, Dynamic, render, memo, Portal, setAttribute } from 'solid-js/web';
import { mergeProps, createSignal, createMemo, Show, createEffect, on, splitProps, For, untrack, onMount, onCleanup, createContext, createSelector, useContext, Index, children } from 'solid-js';
import cs from 'classnames';
import { omit, isNil, isEmpty, compact, get, set, mapValues } from 'lodash-es';
import React, { useRef, useEffect } from 'react';
import { ConfigProvider, DatePicker as DatePicker$1, Select as Select$1, Progress as Progress$1, Upload as Upload$1, Skeleton as Skeleton$1, Image as Image$2 } from 'antd';
export { message } from 'antd';
import { createRoot } from 'react-dom/client';
import zhCN from 'antd/locale/zh_CN';
import { SketchPicker } from 'react-color';

const _tmpl$$g = /*#__PURE__*/template(`<span class="i-ant-design:loading ant-[vertical-align:-0.125em] keyframes-spin ant-[animation:spin_1s_linear_infinite] ant-mr-8px">`),
  _tmpl$2$a = /*#__PURE__*/template(`<button><span>`);
const sizeClassMap = {
  large: 'ant-px-15px ant-py-6px ant-h-40px ant-rounded-8px',
  middle: 'ant-px-15px ant-py-4px ant-h-32px ant-rounded-6px',
  small: 'ant-px-7px ant-h-24px ant-rounded-4px',
  plain: 'ant-p-0'
};
const typeClassMap = {
  default: 'ant-[border:1px_solid_rgb(217,217,217)] ant-bg-white hover:ant-[border-color:var(--light-primary-color)] hover:ant-text-[var(--light-primary-color)]',
  primary: 'ant-border-none ant-bg-[var(--primary-color)] hover:ant-bg-[var(--light-primary-color)] ant-text-white',
  text: 'ant-border-none ant-bg-transparent hover:ant-bg-[rgba(0,0,0,0.06)] active:ant-bg-[rgba(0,0,0,.15)]',
  link: 'ant-border-none ant-bg-transparent ant-text-[var(--primary-color)] hover:ant-text-[var(--light-primary-color)] active:ant-text-[var(--dark-primary-color)]'
};
const Button = props => {
  const mergedProps = mergeProps({
    type: 'default',
    size: 'middle'
  }, props);
  const [innerLoading, setLoading] = createSignal(false);
  const loading = createMemo(() => props.loading ?? innerLoading());
  return (() => {
    const _el$ = _tmpl$2$a(),
      _el$3 = _el$.firstChild;
    _el$.$$click = e => {
      const res = mergedProps.onClick?.(e);
      if (res instanceof Promise) {
        setLoading(true);
        res.finally(() => setLoading(false));
      }
      if (mergedProps.type === 'default' || mergedProps.type === 'primary') {
        const div = document.createElement('div');
        div.className = 'ant-absolute ant-inset-0 ant-rounded-inherit ant-[border:1px_solid_var(--light-primary-color)] ant-[animation:button-border_linear_1s]';
        const onAnimationEnd = () => {
          div.remove();
          div.removeEventListener('animationend', onAnimationEnd);
        };
        div.addEventListener('animationend', onAnimationEnd);
        e.currentTarget.insertBefore(div, e.currentTarget.childNodes[0]);
      }
    };
    const _ref$ = mergedProps.ref;
    typeof _ref$ === "function" ? use(_ref$, _el$) : mergedProps.ref = _el$;
    insert(_el$, createComponent(Show, {
      get when() {
        return loading();
      },
      get children() {
        return _tmpl$$g();
      }
    }), _el$3);
    insert(_el$3, () => mergedProps.children);
    effect(_p$ => {
      const _v$ = cs('ant-relative ant-cursor-pointer', mergedProps.class, sizeClassMap[mergedProps.size], typeClassMap[mergedProps.type], loading() && 'ant-opacity-65'),
        _v$2 = mergedProps.style;
      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _p$._v$2 = style(_el$, _v$2, _p$._v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });
    return _el$;
  })();
};
delegateEvents(["click"]);

/**
 * 等同于 createEffect，但是会忽略首次执行，只在依赖更新时执行。
 */
function createUpdateEffect(deps, fn) {
  createEffect(on(deps, fn, {
    defer: true
  }));
}

function createControllableValue(props, options = {}) {
  const {
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange'
  } = options;
  const getValue = () => props[valuePropName];
  // 为什么不使用 Object.hasOwn？
  // solid 的 proxy 对象对于任何 key，都会返回 true
  const isControlled = () => Object.keys(props).includes(valuePropName);
  let defaultValue = options.defaultValue;
  if (isControlled()) {
    defaultValue = getValue();
  } else if (Object.keys(props).includes(defaultValuePropName)) {
    defaultValue = props[defaultValuePropName];
  }
  const [value, _setValue] = createSignal(defaultValue);
  createUpdateEffect(getValue, () => {
    if (!isControlled()) return;
    // @ts-expect-error
    _setValue(getValue());
  });
  const setValue = v => {
    const newValue = _setValue(v);
    if (trigger) {
      const onChange = props[trigger];
      if (typeof onChange === 'function') {
        onChange(newValue);
      }
    }
    return newValue;
  };
  return [value, setValue];
}

const _tmpl$$f = /*#__PURE__*/template(`<div class="ant-shrink-0 ant-flex ant-justify-center ant-items-center ant-px-11px ant-bg-[rgba(0,0,0,.02)] ant-[border:1px_solid_#d9d9d9] ant-border-r-0 ant-rounded-l-6px ant-text-14px">`),
  _tmpl$2$9 = /*#__PURE__*/template(`<div class="ant-[display:var(--input-after-display)] ant-absolute ant-top-0 ant-bottom-0 ant-right-0 ant-h-[calc(100%-2px)] ant-translate-y-1px -ant-translate-x-1px">`),
  _tmpl$3$6 = /*#__PURE__*/template(`<div class="ant-shrink-0 ant-flex ant-justify-center ant-items-center ant-px-11px ant-bg-[rgba(0,0,0,.02)] ant-[border:1px_solid_#d9d9d9] ant-border-l-0 ant-rounded-r-6px ant-text-14px">`),
  _tmpl$4$1 = /*#__PURE__*/template(`<div class="ant-flex ant-w-full"><div class="ant-w-full ant-relative ant-[--input-after-display:none] hover:ant-[--input-after-display:block] p-hover-child[input]:ant-border-[var(--primary-color)]">`);
function CommonInput(props) {
  const [{
    onChange,
    onPressEnter,
    onKeyDown
  }, inputProps] = splitProps(props, ['defaultValue', 'value', 'class', 'addonBefore', 'addonAfter', 'inputAfter', 'onChange', 'onPressEnter', 'onKeyDown']);
  const [_, controllableProps] = splitProps(props, ['onChange']);
  const [value, setValue] = createControllableValue(controllableProps);
  return (() => {
    const _el$ = _tmpl$4$1(),
      _el$3 = _el$.firstChild;
    insert(_el$, createComponent(Show, {
      get when() {
        return props.addonBefore;
      },
      get children() {
        const _el$2 = _tmpl$$f();
        insert(_el$2, () => props.addonBefore);
        return _el$2;
      }
    }), _el$3);
    insert(_el$3, createComponent(Dynamic, mergeProps$1({
      get component() {
        return props.textarea ? 'textarea' : 'input';
      }
    }, inputProps, {
      get ["class"]() {
        return cs('ant-w-full ant-py-0 ant-px-11px ant-[outline:none] ant-text-14px ant-rounded-6px ant-[border:1px_solid_#d9d9d9] focus:ant-border-[var(--primary-color)] focus:ant-[box-shadow:0_0_0_2px_rgba(5,145,255,0.1)] ant-py-8px', !props.textarea && 'ant-h-32px', props.class, props.addonBefore && 'ant-rounded-l-0', props.addonAfter && 'ant-rounded-r-0');
      },
      get value() {
        return value() ?? '';
      },
      onInput: e => {
        setValue(e.target.value);
        onChange?.(e);
      },
      onKeyDown: e => {
        if (e.key === 'Enter') {
          onPressEnter?.(e);
        }
        onKeyDown?.(e);
      }
    })), null);
    insert(_el$3, createComponent(Show, {
      get when() {
        return props.inputAfter;
      },
      get children() {
        const _el$4 = _tmpl$2$9();
        insert(_el$4, () => props.inputAfter);
        return _el$4;
      }
    }), null);
    insert(_el$, createComponent(Show, {
      get when() {
        return props.addonAfter;
      },
      get children() {
        const _el$5 = _tmpl$3$6();
        insert(_el$5, () => props.addonAfter);
        return _el$5;
      }
    }), null);
    return _el$;
  })();
}
const Input = props => {
  return createComponent(CommonInput, mergeProps$1(() => omit(props, ['inputAfter'])));
};
Input.TextArea = props => {
  return createComponent(CommonInput, mergeProps$1({
    textarea: true
  }, () => omit(props, ['inputAfter'])));
};

const SolidToReact = ({
  children,
  container
}) => {
  const ref = useRef();
  useEffect(() => render(() => children, ref.current), []);
  // if (import.meta.env.SSR) {
  //   return React.createElement('div', {
  //     dangerouslySetInnerHTML: { __html: renderToString(() => children) },
  //   })
  // }
  return container ? React.cloneElement(container, {
    ref
  }) : React.createElement('div', {
    ref,
    role: 'SolidToReact'
  });
};

/**
 * 判断 JSXElement 是否是基础类型
 * @param value JSXElement
 * @returns
 */
function isBaseType(value) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined;
}
function solidToReact(children) {
  return isBaseType(children) ? children : React.createElement(SolidToReact, {
    children
  });
}
function dispatchEventHandlerUnion(handler, e) {
  if (isNil(handler)) {
    return;
  }
  if (typeof handler === 'function') {
    handler(e);
    return;
  }
  handler[0](handler[1], e);
}

const _tmpl$$e = /*#__PURE__*/template(`<div class="ant-flex ant-flex-col ant-h-full ant-w-24px ant-[border-left:1px_solid_#d9d9d9]"><div class="ant-text-12px ant-flex ant-justify-center ant-items-center ant-h-1/2 ant-cursor-pointer ant-opacity-70 hover:ant-h-100% hover:ant-text-[var(--primary-color)] ant-transition-color ant-transition-height ant-transition-duration-500"><div class="i-ant-design:up-outlined"></div></div><div class="ant-[border-top:1px_solid_#d9d9d9] ant-text-12px ant-flex ant-justify-center ant-items-center ant-h-1/2 ant-cursor-pointer ant-opacity-70 hover:ant-h-100% hover:ant-text-[var(--primary-color)] ant-transition-color ant-transition-height ant-transition-duration-500"><div class="i-ant-design:down-outlined">`);
const isEmptyValue = value => isNil(value) || value === '';
const formatNum = (v, prev) => {
  if (isEmptyValue(v)) {
    return null;
  }
  const num = Number(v);
  if (prev !== undefined && Number.isNaN(num)) {
    return prev;
  }
  return num;
};
const InputNumber = props => {
  const [{
    onChange,
    onBlur
  }, inputProps] = splitProps(props, ['defaultValue', 'value', 'onChange', 'onBlur']);
  const [_, controllableProps] = splitProps(props, ['onChange']);
  const [value, setValue] = createControllableValue(controllableProps);
  const add = addon => {
    setValue(v => {
      if (isEmptyValue(v)) {
        return addon;
      }
      const num = Number(v);
      if (Number.isNaN(num)) {
        return v;
      }
      return num + addon;
    });
  };
  const up = () => {
    add(1);
  };
  const down = () => {
    add(-1);
  };
  createEffect(on(value, (input, __, prev) => {
    const num = formatNum(input, prev);
    if (num !== prev) {
      prev = num;
      onChange?.(num);
    }
    return num;
  }, {
    defer: true
  }));
  return createComponent(CommonInput, mergeProps$1(inputProps, {
    get inputAfter() {
      return (() => {
        const _el$ = _tmpl$$e(),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling;
        _el$2.$$click = up;
        _el$3.$$click = down;
        return _el$;
      })();
    },
    get value() {
      return `${value() ?? ''}`;
    },
    onKeyDown: e => {
      switch (e.key) {
        case 'ArrowUp':
          up();
          e.preventDefault();
          return;
        case 'ArrowDown':
          down();
          e.preventDefault();
      }
    },
    onChange: e => {
      const newValue = e.target.value || null;
      setValue(newValue);
    },
    onBlur: e => {
      const newValue = e.target.value || null;
      setValue(formatNum(newValue));
      dispatchEventHandlerUnion(onBlur, e);
    }
  }));
};
delegateEvents(["click"]);

const _tmpl$$d = /*#__PURE__*/template(`<div class="ant-flex ant-flex-col ant-gap-[16px]">`),
  _tmpl$2$8 = /*#__PURE__*/template(`<div class="ant-flex ant-relative"><div class="ant-w-[10px] ant-h-[10px] ant-border-solid ant-border-width-[3px] ant-border-[var(--primary-color)] ant-bg-white ant-rounded-[50%] ant-mt-[8px]"></div><div class="ant-ml-[8px]">`),
  _tmpl$3$5 = /*#__PURE__*/template(`<div class="ant-absolute ant-top-[8px] ant-bottom-[-24px] ant-left-[4px] ant-w-[2px] ant-bg-[rgba(5,5,5,.06)]">`);
const Timeline = props => {
  return (() => {
    const _el$ = _tmpl$$d();
    insert(_el$, createComponent(For, {
      get each() {
        return props.items;
      },
      children: (item, i) => (() => {
        const _el$2 = _tmpl$2$8(),
          _el$3 = _el$2.firstChild,
          _el$4 = _el$3.nextSibling;
        insert(_el$2, (() => {
          const _c$ = memo(() => i() !== props.items.length - 1);
          return () => _c$() && _tmpl$3$5();
        })(), _el$3);
        insert(_el$4, () => item.children?.());
        return _el$2;
      })()
    }));
    return _el$;
  })();
};

const _tmpl$$c = /*#__PURE__*/template(`<div><div><div class="ant-text-[rgba(0,0,0,.88)] ant-text-16px ant-font-600 ant-mb-8px"></div><div></div><div class="ant-text-right">`),
  _tmpl$2$7 = /*#__PURE__*/template(`<span class="i-ant-design:exclamation-circle ant-text-22px ant-mr-12px ant-text-[var(--warning-color)]">`),
  _tmpl$3$4 = /*#__PURE__*/template(`<div class="ant-ml-34px">`);
function Modal(props) {
  const [open, setOpen] = createSignal(props.initialOpen ?? false);
  const close = () => {
    setOpen(false);
    props.afterClose?.();
  };
  const instance = {
    open() {
      setOpen(true);
    },
    close() {
      setOpen(false);
    }
  };
  untrack(() => props.ref?.(instance));
  const [confirmLoading, setConfirmLoading] = createSignal(false);
  return createComponent(Show, {
    get when() {
      return open();
    },
    get children() {
      return createComponent(Portal, {
        get children() {
          const _el$ = _tmpl$$c(),
            _el$2 = _el$.firstChild,
            _el$3 = _el$2.firstChild,
            _el$4 = _el$3.nextSibling,
            _el$5 = _el$4.nextSibling;
          _el$.$$click = () => {
            if (props.maskClosable ?? true) {
              close();
            }
          };
          _el$2.$$click = e => {
            e.stopPropagation();
          };
          insert(_el$2, createComponent(Show, {
            get when() {
              return props.closeIcon !== false;
            },
            get children() {
              return createComponent(Button, {
                type: "text",
                get ["class"]() {
                  return cs("before:ant-content-[''] before:ant-block before:i-ant-design:close-outlined ant-rm-size-btn !ant-w-22px !ant-h-22px !ant-flex !ant-justify-center !ant-items-center ant-text-center ant-text-18px !ant-absolute !ant-top-16px !ant-right-16px ant-z-1000 ant-text-[rgba(0,0,0,.45)] hover:!ant-text-[rgba(0,0,0,.88)]", props.closeIconClass);
                },
                onClick: close
              });
            }
          }), _el$3);
          insert(_el$3, () => props.title);
          insert(_el$4, () => props.children);
          insert(_el$5, createComponent(Button, {
            onClick: close,
            children: "\u53D6\u6D88"
          }), null);
          insert(_el$5, createComponent(Button, {
            type: "primary",
            "class": "!ant-ml-8px",
            get loading() {
              return confirmLoading();
            },
            onClick: async () => {
              if (!props.onOk) return;
              let res = props.onOk?.();
              if (res instanceof Promise) {
                setConfirmLoading(true);
                res = await res.finally(() => setConfirmLoading(false));
              }
              if (res) {
                instance.close();
              }
            },
            children: "\u786E\u5B9A"
          }), null);
          effect(_p$ => {
            const _v$ = cs('ant-fixed ant-justify-center ant-inset-0 ant-bg-[rgba(0,0,0,.45)] ant-flex ant-z-1000', props.centered && 'ant-items-center'),
              _v$2 = cs('ant-absolute ant-px-24px ant-py-20px ant-rounded-8px ant-overflow-hidden ant-bg-white',
              // '!ant-[animation-duration:.5s]',
              !props.centered && 'ant-top-100px', props.contentClass),
              _v$3 = props.width ?? '520px';
            _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
            _v$2 !== _p$._v$2 && className(_el$2, _p$._v$2 = _v$2);
            _v$3 !== _p$._v$3 && ((_p$._v$3 = _v$3) != null ? _el$2.style.setProperty("width", _v$3) : _el$2.style.removeProperty("width"));
            return _p$;
          }, {
            _v$: undefined,
            _v$2: undefined,
            _v$3: undefined
          });
          return _el$;
        }
      });
    }
  });
}
Modal.warning = props => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const dispose = render(() => createComponent(Modal, mergeProps$1({
    width: "416px",
    maskClosable: false,
    closeIcon: false
  }, props, {
    get title() {
      return [_tmpl$2$7(), memo(() => props.title)];
    },
    get children() {
      return (() => {
        const _el$7 = _tmpl$3$4();
        insert(_el$7, () => props.children);
        return _el$7;
      })();
    },
    initialOpen: true,
    afterClose: () => {
      document.body.removeChild(div);
      dispose();
      props.afterClose?.();
    }
  })), div);
};
delegateEvents(["click"]);

const _tmpl$$b = /*#__PURE__*/template(`<div role="ReactToSolid">`);
function ReactToSolid(props) {
  let root;
  const rootEle = createMemo(() => props.container ?? _tmpl$$b());
  onMount(() => {
    root = createRoot(rootEle());
    onCleanup(() => {
      root.unmount();
    });
  });
  createEffect(() => {
    root.render(React.createElement(props.component, {
      ...props.props
    }));
  });
  // if (import.meta.env.SSR) {
  //   // eslint-disable-next-line solid/reactivity
  //   const node = React.createElement(props.component, { ...props.props })
  //   // eslint-disable-next-line solid/components-return-once, solid/no-innerhtml
  //   return <div innerHTML={renderToString(node)} />
  // }
  return rootEle;
}

/**
 * 将组件 props 中的 className 替换为 class
 * @param C
 * @returns
 */
function replaceClassName(C) {
  return function (_props) {
    const props = createMemo(() => {
      return {
        ...omit(_props, 'class'),
        className: _props.class
      };
    });
    return createComponent(C, mergeProps$1(props));
  };
}
/**
 * 将组件 props 中的 children 替换为 JSXElement
 * @param C
 * @returns
 */
function replaceChildren(C) {
  return function (_props) {
    const props = createMemo(() => {
      return {
        ..._props,
        children: solidToReact(_props.children)
      };
    });
    return createComponent(C, mergeProps$1(props));
  };
}
function reactToSolidComponent(component, container) {
  return function (props) {
    return createComponent(ReactToSolid, {
      component: component,
      props: props,
      get container() {
        return typeof container === 'function' ? container() : container;
      }
    });
  };
}
/**
 * 返回被 ConfigProvider 包裹后的 component
 * @param component
 * @param configProviderProps
 * @returns
 */
function configProvider(component, configProviderProps) {
  return function (props) {
    return React.createElement(ConfigProvider, {
      locale: zhCN,
      ...configProviderProps
    }, React.createElement(component, props));
  };
}

const RangePicker = replaceClassName(reactToSolidComponent(DatePicker$1.RangePicker));
const _DatePicker = replaceClassName(reactToSolidComponent(DatePicker$1));
const DatePicker = _DatePicker;
DatePicker.RangePicker = RangePicker;

const Select = replaceClassName(reactToSolidComponent(Select$1));

const _tmpl$$a = /*#__PURE__*/template(`<span class="i-ant-design:minus-square-outlined">`),
  _tmpl$2$6 = /*#__PURE__*/template(`<div><div class="flex-shrink-0" role="indent"></div><div class="ant-flex-shrink-0 ant-w-24px ant-h-24px ant-flex ant-items-center ant-justify-center"><span class="i-ant-design:holder-outlined"></span></div><div></div><div>`),
  _tmpl$3$3 = /*#__PURE__*/template(`<span class="ant-inline-block ant-w-24px">`),
  _tmpl$4 = /*#__PURE__*/template(`<span class="i-ant-design:plus-square-outlined">`);
const TreeContext = createContext({});
/**
 * 单层级 tree
 */
function SingleLevelTree(props) {
  const [expanded, setExpanded] = createSignal(props.defaultExpandAll);
  const {
    selectedNodes,
    setSelectedNodes,
    draggableNode,
    setDraggableNode,
    draggableIndexes,
    setDraggableIndexes,
    isDraggable,
    targetNode,
    setTargetNode,
    targetIndexes,
    setTargetIndexes,
    isTarget,
    draggable,
    onDrop
  } = useContext(TreeContext);
  return createComponent(Index, {
    get each() {
      return props.treeData;
    },
    children: (item, i) => {
      const indexes = [...(props.parentIndexes ?? []), i];
      return [(() => {
        const _el$ = _tmpl$2$6(),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling,
          _el$4 = _el$3.nextSibling,
          _el$6 = _el$4.nextSibling;
        _el$.addEventListener("dragend", () => {
          onDrop?.({
            dragNode: draggableNode(),
            dragIndexes: draggableIndexes(),
            targetNode: targetNode(),
            targetIndexes: targetIndexes()
          });
          setDraggableNode(null);
          setDraggableIndexes(null);
          setTargetNode(null);
          setTargetIndexes(null);
        });
        _el$.addEventListener("dragleave", e => {
          if (item() === targetNode() && e.relatedTarget) {
            setTargetNode(null);
            setTargetIndexes(null);
          }
        });
        _el$.addEventListener("dragenter", () => {
          if (item() !== draggableNode()) {
            setTargetNode(item());
            setTargetIndexes(indexes);
          }
        });
        _el$.addEventListener("dragstart", () => {
          setDraggableNode(item());
          setDraggableIndexes(indexes);
        });
        setAttribute(_el$, "draggable", draggable);
        insert(_el$2, () => Array(props.indent).fill(0).map(() => _tmpl$3$3()));
        insert(_el$4, createComponent(Show, {
          get when() {
            return expanded();
          },
          get fallback() {
            return (() => {
              const _el$8 = _tmpl$4();
              _el$8.$$click = setExpanded;
              _el$8.$$clickData = true;
              return _el$8;
            })();
          },
          get children() {
            const _el$5 = _tmpl$$a();
            _el$5.$$click = setExpanded;
            _el$5.$$clickData = false;
            return _el$5;
          }
        }));
        _el$6.$$click = () => {
          setSelectedNodes([item()]);
          props.onSelect?.(item());
        };
        insert(_el$6, () => props.titleRender(item(), {
          indexes
        }));
        effect(_p$ => {
          const _v$ = cs('ant-flex ant-items-center ant-h-28px ant-pb-4px', isDraggable(item()) && 'ant-[border:1px_solid_var(--primary-color)] ant-bg-white', draggableNode() && 'child[]:ant-pointer-events-none'),
            _v$2 = cs('ant-flex-shrink-0 ant-w-24px ant-h-24px ant-flex ant-items-center ant-justify-center ant-cursor-pointer', isEmpty(props.children(item())) && 'opacity-0'),
            _v$3 = cs('ant-h-full ant-leading-24px ant-hover:bg-[rgba(0,0,0,.04)] ant-rounded-1 ant-px-1 ant-cursor-pointer ant-relative', props.blockNode && 'w-full', selectedNodes()?.includes(item()) && '!ant-bg-[var(--active-bg-color)]', isTarget(item()) && "before:ant-content-[''] before:ant-inline-block before:ant-w-8px before:ant-h-8px before:ant-absolute before:ant-bottom-0 before:ant-left-0 before:-ant-translate-x-full before:ant-translate-y-1/2 before:ant-rounded-1/2 before:ant-[border:2px_solid_var(--primary-color)] after:ant-content-[''] after:ant-inline-block after:ant-h-2px after:ant-absolute after:ant-left-0 after:ant-right-0 after:ant-bottom--1px after:ant-bg-[var(--primary-color)]");
          _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
          _v$2 !== _p$._v$2 && className(_el$4, _p$._v$2 = _v$2);
          _v$3 !== _p$._v$3 && className(_el$6, _p$._v$3 = _v$3);
          return _p$;
        }, {
          _v$: undefined,
          _v$2: undefined,
          _v$3: undefined
        });
        return _el$;
      })(), createComponent(Show, {
        get when() {
          return memo(() => !!expanded())() && !isEmpty(props.children(item()));
        },
        get children() {
          return createComponent(SingleLevelTree, {
            get treeData() {
              return props.children(item());
            },
            get indent() {
              return props.indent + 1;
            },
            parentIndexes: indexes,
            get blockNode() {
              return props.blockNode;
            },
            get defaultExpandAll() {
              return props.defaultExpandAll;
            },
            get titleRender() {
              return props.titleRender;
            },
            get children() {
              return props.children;
            },
            onSelect: node => untrack(() => props.onSelect?.(node))
          });
        }
      })];
    }
  });
}
function Tree(props) {
  const [selectedNodes, setSelectedNodes] = createSignal(props.defaultSelectedNodes ?? []);
  const [draggableNode, setDraggableNode] = createSignal(null);
  const isDraggable = createSelector(draggableNode);
  const [draggableIndexes, setDraggableIndexes] = createSignal(null);
  const [targetNode, setTargetNode] = createSignal(null);
  const isTarget = createSelector(targetNode);
  const [targetIndexes, setTargetIndexes] = createSignal(null);
  return createComponent(TreeContext.Provider, {
    get value() {
      return {
        selectedNodes,
        setSelectedNodes,
        draggableNode,
        setDraggableNode,
        draggableIndexes,
        setDraggableIndexes,
        isDraggable,
        targetNode,
        setTargetNode,
        targetIndexes,
        setTargetIndexes,
        isTarget,
        draggable: props.draggable,
        onDrop: props.onDrop
      };
    },
    get children() {
      return createComponent(SingleLevelTree, {
        get treeData() {
          return props.treeData;
        },
        indent: 0,
        get blockNode() {
          return props.blockNode;
        },
        get defaultExpandAll() {
          return props.defaultExpandAll;
        },
        get titleRender() {
          return props.titleRender;
        },
        get children() {
          return props.children;
        },
        onSelect: node => untrack(() => props.onSelect?.(node))
      });
    }
  });
}
delegateEvents(["click"]);

/**
 * 如果传入一个非数组字段，则将其转化为数组
 * @param value
 * @returns
 */
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function useClickAway(onClickAway, target) {
  const onClick = event => {
    const targets = target ? toArray(target()) : [];
    if (targets.every(item => !item.contains(event.target))) {
      onClickAway(event);
    }
  };
  document.body.addEventListener('click', onClick);
  onCleanup(() => {
    document.body.removeEventListener('click', onClick);
  });
}

const _tmpl$$9 = /*#__PURE__*/template(`<div>`),
  _tmpl$2$5 = /*#__PURE__*/template(`<div><div>`);
const Content = props => {
  return createComponent(Show, {
    get when() {
      return typeof props.content === 'function';
    },
    get fallback() {
      return props.content;
    },
    get children() {
      return memo(() => typeof props.content === 'function')() && props.content(props.close);
    }
  });
};
const Tooltip = _props => {
  const props = mergeProps({
    trigger: 'hover',
    placement: 'top',
    mode: 'dark',
    arrow: true
  }, _props);
  const resolvedChildren = children(() => _props.children);
  let contentWrap;
  let arrow;
  const [open, setOpen] = createControllableValue(_props, {
    defaultValue: false,
    valuePropName: 'open',
    trigger: 'onOpenChange'
  });
  const reverseOpen = () => setOpen(v => !v);
  createEffect(() => {
    const _children = resolvedChildren();
    switch (props.trigger) {
      case 'hover':
        _children.addEventListener('mouseenter', reverseOpen);
        onCleanup(() => {
          _children.removeEventListener('mouseenter', reverseOpen);
        });
        _children.addEventListener('mouseleave', reverseOpen);
        onCleanup(() => {
          _children.removeEventListener('mouseleave', reverseOpen);
        });
        break;
      case 'click':
        _children.addEventListener('click', reverseOpen);
        onCleanup(() => {
          _children.removeEventListener('click', reverseOpen);
        });
        useClickAway(() => setOpen(false), () => compact([contentWrap, _children]));
        break;
    }
  });
  createEffect(() => {
    if (open()) {
      const _children = resolvedChildren();
      const childrenRect = _children.getBoundingClientRect();
      const pointAtCenter = typeof props.arrow === 'object' ? props.arrow.pointAtCenter : false;
      const arrowOffset = 8;
      switch (props.placement) {
        case 'top':
          contentWrap.style.top = `${childrenRect.top}px`;
          contentWrap.style.left = `${childrenRect.left + childrenRect.width / 2}px`;
          contentWrap.style.transform = 'translate(-50%, -100%)';
          break;
        case 'topRight':
          contentWrap.style.top = `${childrenRect.top}px`;
          contentWrap.style.left = `${childrenRect.right}px`;
          contentWrap.style.transform = 'translate(-100%, -100%)';
          if (arrow) arrow.style.right = `${arrowOffset}px`;
          break;
        case 'bottom':
          contentWrap.style.top = `${childrenRect.top + childrenRect.height}px`;
          contentWrap.style.left = `${childrenRect.left + childrenRect.width / 2}px`;
          contentWrap.style.transform = 'translate(-50%, 0)';
          break;
        case 'bottomLeft':
          contentWrap.style.top = `${childrenRect.top + childrenRect.height}px`;
          contentWrap.style.left = `${childrenRect.left}px`;
          if (arrow) arrow.style.left = `${arrowOffset}px`;
          break;
        case 'bottomRight':
          contentWrap.style.top = `${childrenRect.top + childrenRect.height}px`;
          contentWrap.style.left = `${childrenRect.right + (pointAtCenter ? arrowOffset : 0)}px`;
          contentWrap.style.transform = 'translate(-100%, 0)';
          if (arrow) arrow.style.right = `${arrowOffset}px`;
          break;
      }
    }
  });
  const direction = createMemo(() => {
    if (props.placement?.startsWith('top')) return 'top';
    if (props.placement?.startsWith('bottom')) return 'bottom';
    if (props.placement?.startsWith('left')) return 'left';
    if (props.placement?.startsWith('right')) return 'right';
  });
  return [resolvedChildren, createComponent(Show, {
    get when() {
      return open();
    },
    get children() {
      return createComponent(Portal, {
        get children() {
          const _el$ = _tmpl$2$5(),
            _el$2 = _el$.firstChild;
          _el$.$$click = e => {
            e.stopPropagation();
          };
          const _ref$ = contentWrap;
          typeof _ref$ === "function" ? use(_ref$, _el$) : contentWrap = _el$;
          insert(_el$2, createComponent(Content, {
            get content() {
              return props.content;
            },
            close: () => setOpen(false)
          }));
          insert(_el$, createComponent(Show, {
            get when() {
              return props.arrow;
            },
            get children() {
              const _el$3 = _tmpl$$9();
              const _ref$2 = arrow;
              typeof _ref$2 === "function" ? use(_ref$2, _el$3) : arrow = _el$3;
              effect(() => className(_el$3, cs('ant-w-8px ant-h-8px ant-rotate-45 ant-absolute', props.mode === 'dark' ? 'ant-bg-[rgba(0,0,0,0.85)]' : 'ant-bg-white', direction() === 'top' && 'ant-bottom-0 -ant-translate-x-1/2 -ant-translate-y-1/2 ant-[filter:drop-shadow(3px_2px_2px_rgba(0,0,0,0.08))]', direction() === 'bottom' && 'ant-top-0 -ant-translate-x-1/2 ant-translate-y-1/2 ant-[filter:drop-shadow(-3px_-2px_2px_rgba(0,0,0,0.08))]', (props.placement === 'top' || props.placement === 'bottom') && 'left-1/2')));
              return _el$3;
            }
          }), null);
          effect(_p$ => {
            const _v$ = cs('ant-z-1000 ant-fixed after:ant-content-empty', props.arrow ? '[--padding:8px]' : '[--padding:4px]', direction() === 'top' && 'ant-pb-[var(--padding)]', direction() === 'bottom' && 'ant-pt-[var(--padding)]'),
              _v$2 = cs('ant-p-12px ant-rounded-8px ant-[box-shadow:0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]', props.mode === 'dark' ? 'ant-bg-[rgba(0,0,0,0.85)] ant-text-white' : 'ant-bg-white');
            _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
            _v$2 !== _p$._v$2 && className(_el$2, _p$._v$2 = _v$2);
            return _p$;
          }, {
            _v$: undefined,
            _v$2: undefined
          });
          return _el$;
        }
      });
    }
  })];
};
delegateEvents(["click"]);

const _tmpl$$8 = /*#__PURE__*/template(`<div class="ant-mb-8px ant-flex ant-items-center"><span class="ant-text-[rgba(0,0,0,0.88)] ant-font-600">`),
  _tmpl$2$4 = /*#__PURE__*/template(`<div><div class="ant-text-[rgba(0,0,0,0.88)]">`);
const Popover = props => {
  return createComponent(Tooltip, mergeProps$1({
    mode: "light"
  }, props, {
    content: close => (() => {
      const _el$ = _tmpl$2$4(),
        _el$4 = _el$.firstChild;
      insert(_el$, createComponent(Show, {
        get when() {
          return props.title;
        },
        get children() {
          const _el$2 = _tmpl$$8(),
            _el$3 = _el$2.firstChild;
          insert(_el$3, () => props.title);
          return _el$2;
        }
      }), _el$4);
      insert(_el$4, createComponent(Content, {
        get content() {
          return props.content;
        },
        close: close
      }));
      return _el$;
    })()
  }));
};

const _SketchPicker = reactToSolidComponent(SketchPicker);
function isRGBColor(color) {
  return ['r', 'g', 'b'].every(k => !isNil(get(color, k)));
}
function isHSLColor(color) {
  return ['r', 'g', 'b'].every(k => !isNil(get(color, k)));
}
function colorStringify(color) {
  if (!color) return;
  if (isRGBColor(color)) return `rgba(${color.r},${color.g},${color.b},${color.a ?? 1})`;
  if (isHSLColor(color)) return `hsla(${color.h},${color.s},${color.l},${color.a ?? 1})`;
  return color;
}
const ColorPicker = _props => {
  const props = mergeProps({
    type: 'rgba'
  }, _props);
  const [color, setColor] = createSignal(props.defaultColor ?? 'black');
  return createComponent(Popover, {
    get content() {
      return createComponent(_SketchPicker, {
        get color() {
          return color();
        },
        onChange: colorResult => {
          untrack(() => {
            const colorString = colorStringify(props.type === 'rgba' ? colorResult.rgb : colorResult.hsl);
            setColor(colorString);
            props.onChange?.(colorString, colorResult);
          });
        }
      });
    },
    trigger: "click",
    placement: "bottomLeft",
    get children() {
      return createComponent(Button, {
        get style() {
          return {
            background: color()
          };
        }
      });
    }
  });
};

const _tmpl$$7 = /*#__PURE__*/template(`<div class="ant-text-center ant-px-32px ant-py-48px"><div class="ant-mb-24px"><span></span></div><div class="ant-my-8px ant-text-[rgba(0,0,0,.88)] ant-text-24px"></div><div class="ant-text-[rgba(0,0,0,.45)] ant-text-14px"></div><div class="ant-mt-24px"></div><div class="ant-mt-24px">`);
const statusIconMap = {
  success: 'ant-text-#52c41a i-ant-design:check-circle-filled',
  info: 'ant-text-[var(--primary-color)] i-ant-design:exclamation-circle-filled',
  warning: 'ant-text-#faad14 i-ant-design:warning-filled',
  error: 'ant-text-#ff4d4f i-ant-design:close-circle-filled'
};
const Result = props => {
  return (() => {
    const _el$ = _tmpl$$7(),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.firstChild,
      _el$4 = _el$2.nextSibling,
      _el$5 = _el$4.nextSibling,
      _el$6 = _el$5.nextSibling,
      _el$7 = _el$6.nextSibling;
    insert(_el$4, () => props.title);
    insert(_el$5, () => props.subTitle);
    insert(_el$6, () => props.extra);
    insert(_el$7, () => props.children);
    effect(() => className(_el$3, cs(statusIconMap[props.status], 'ant-text-72px')));
    return _el$;
  })();
};

var Progress = replaceChildren(replaceClassName(reactToSolidComponent(Progress$1)));

const _tmpl$$6 = /*#__PURE__*/template(`<div class="ant-px-12px ant-py-16px ant-overflow-auto">`),
  _tmpl$2$3 = /*#__PURE__*/template(`<div><div><div role="selected-bar" class="ant-absolute ant-bottom-0 ant-bg-[var(--primary-color)] ant-h-2px ant-transition-left">`),
  _tmpl$3$2 = /*#__PURE__*/template(`<div>`);
const Tabs = props => {
  const [selectedItem, setSelectedItem] = createSignal(untrack(() => props.items[0]));
  const isSelectedItem = createSelector(() => selectedItem()?.key);
  const [selectedBarStyle, setSelectedBarStyle] = createSignal({
    left: '0px',
    width: '0px'
  });
  const updateSelectedBarStyle = el => {
    setSelectedBarStyle({
      left: `${el.offsetLeft}px`,
      width: `${el.clientWidth}px`
    });
  };
  let navWrap;
  onMount(() => {
    updateSelectedBarStyle(navWrap.children[0]);
  });
  return (() => {
    const _el$ = _tmpl$2$3(),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.firstChild;
    const _ref$ = navWrap;
    typeof _ref$ === "function" ? use(_ref$, _el$2) : navWrap = _el$2;
    insert(_el$2, createComponent(For, {
      get each() {
        return props.items;
      },
      children: item => (() => {
        const _el$5 = _tmpl$3$2();
        _el$5.$$click = e => {
          setSelectedItem(item);
          updateSelectedBarStyle(e.currentTarget);
        };
        insert(_el$5, () => item.label);
        effect(() => className(_el$5, cs('ant-py-12px ant-cursor-pointer', props.navItemClass, isSelectedItem(item.key) && 'ant-text-[var(--primary-color)]')));
        return _el$5;
      })()
    }), _el$3);
    insert(_el$, createComponent(Show, {
      get when() {
        return !isNil(selectedItem()?.children);
      },
      get children() {
        const _el$4 = _tmpl$$6();
        insert(_el$4, () => selectedItem()?.children);
        return _el$4;
      }
    }), null);
    effect(_p$ => {
      const _v$ = cs(props.class, 'ant-grid ant-[grid-template-rows:auto_1fr]'),
        _v$2 = cs('ant-flex ant-gap-32px ant-[border-bottom:solid_1px_rgba(5,5,5,0.1)] ant-relative', props.navWrapClass),
        _v$3 = selectedBarStyle();
      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && className(_el$2, _p$._v$2 = _v$2);
      _p$._v$3 = style(_el$3, _v$3, _p$._v$3);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined,
      _v$3: undefined
    });
    return _el$;
  })();
};
delegateEvents(["click"]);

const _tmpl$$5 = /*#__PURE__*/template(`<div><div class="ant-mb-8px ant-flex ant-items-center"><span class="i-ant-design:exclamation-circle-fill ant-text-#faad14"></span><span class="ant-ml-8px ant-text-[rgba(0,0,0,0.88)] ant-font-600"></span></div><div class="ant-ml-22px ant-mb-8px ant-text-[rgba(0,0,0,0.88)]"></div><div class="ant-text-right">`);
const Popconfirm = props => {
  const mergedProps = mergeProps({
    okText: '确定',
    cancelText: '取消'
  }, props);
  const [open, setOpen] = createSignal(false);
  return createComponent(Tooltip, {
    mode: "light",
    trigger: "click",
    get open() {
      return open();
    },
    onOpenChange: setOpen,
    get content() {
      return (() => {
        const _el$ = _tmpl$$5(),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.firstChild,
          _el$4 = _el$3.nextSibling,
          _el$5 = _el$2.nextSibling,
          _el$6 = _el$5.nextSibling;
        insert(_el$4, () => mergedProps.title);
        insert(_el$5, () => mergedProps.content);
        insert(_el$6, createComponent(Button, {
          "class": "ant-ml-8px",
          size: "small",
          onClick: () => {
            setOpen(false);
            untrack(() => mergedProps.onCancel?.());
          },
          get children() {
            return mergedProps.cancelText;
          }
        }), null);
        insert(_el$6, createComponent(Button, {
          "class": "ant-ml-8px",
          type: "primary",
          size: "small",
          onClick: () => {
            setOpen(false);
            untrack(() => mergedProps.onConfirm?.());
          },
          get children() {
            return mergedProps.okText;
          }
        }), null);
        return _el$;
      })();
    },
    get children() {
      return mergedProps.children;
    }
  });
};

const Upload = replaceChildren(replaceClassName(reactToSolidComponent(Upload$1)));

const _tmpl$$4 = /*#__PURE__*/template(`<label class="ant-inline-flex ant-gap-4px"><input type="radio">`),
  _tmpl$2$2 = /*#__PURE__*/template(`<label><input class="ant-w-0 ant-h-0" type="radio">`),
  _tmpl$3$1 = /*#__PURE__*/template(`<div>`);
const Radio = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: undefined
  });
  return (() => {
    const _el$ = _tmpl$$4(),
      _el$2 = _el$.firstChild;
    _el$2.$$input = e => {
      setChecked(e.target.checked);
      untrack(() => props.onChange?.(e));
    };
    insert(_el$, () => props.children, null);
    effect(() => _el$2.checked = checked());
    effect(() => _el$2.value = props.value ?? '');
    return _el$;
  })();
};
Radio.Button = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked',
    trigger: undefined
  });
  return (() => {
    const _el$3 = _tmpl$2$2(),
      _el$4 = _el$3.firstChild;
    _el$4.$$input = e => {
      setChecked(e.target.checked);
      untrack(() => props.onChange?.(e));
    };
    insert(_el$3, () => props.children, null);
    effect(() => className(_el$3, cs('ant-px-15px ant-[border:1px_solid_rgb(217,217,217)] first:ant-rounded-l-6px last:ant-rounded-r-6px ant-h-32px ant-inline-flex ant-items-center hover:ant-text-[var(--primary-color)] not[:last-child]:ant-border-r-transparent ant-cursor-pointer ant-flex-grow ant-justify-center', checked() && 'ant-text-[var(--primary-color)] ant-[border:1px_solid_var(--primary-color)] !ant-border-r-[var(--primary-color)]')));
    effect(() => _el$4.checked = checked());
    effect(() => _el$4.value = props.value ?? '');
    return _el$3;
  })();
};
Radio.Group = _props => {
  const props = mergeProps({
    optionType: 'default'
  }, _props);
  const [value, setValue] = createControllableValue(props, {
    trigger: undefined
  });
  const isChecked = createSelector(value);
  return (() => {
    const _el$5 = _tmpl$3$1();
    insert(_el$5, createComponent(For, {
      get each() {
        return props.options;
      },
      children: option => createComponent(Dynamic, {
        get component() {
          return props.optionType === 'default' ? Radio : Radio.Button;
        },
        get checked() {
          return isChecked(option.value);
        },
        get value() {
          return option.value;
        },
        onChange: e => {
          setValue(option.value);
          untrack(() => props.onChange?.(e));
        },
        get children() {
          return option.label;
        }
      })
    }));
    effect(() => className(_el$5, cs(props.block ? 'ant-flex' : 'ant-inline-flex', props.optionType === 'default' ? 'ant-gap-8px' : '')));
    return _el$5;
  })();
};
delegateEvents(["input"]);

const _tmpl$$3 = /*#__PURE__*/template(`<div>`),
  _tmpl$2$1 = /*#__PURE__*/template(`<span class="ant-mr-4px ant-text-[var(--error-color)]">*`),
  _tmpl$3 = /*#__PURE__*/template(`<div><span class="ant-flex-shrink-0 ant-mr-8px"><label>`);
function Form(_props) {
  const props = mergeProps({
    layout: 'horizontal'
  }, _props);
  const resolvedChildren = createMemo(() => {
    return toArray(props.children);
  });
  const values = Object.fromEntries(resolvedChildren().map(child => [child.name, child.initialValue]));
  const formInstance = {
    async validateFields() {
      return await Promise.resolve(values);
    }
  };
  _props.ref?.(formInstance);
  return (() => {
    const _el$ = _tmpl$$3();
    insert(_el$, createComponent(Index, {
      get each() {
        return resolvedChildren();
      },
      children: item => (() => {
        const _el$2 = _tmpl$3(),
          _el$3 = _el$2.firstChild,
          _el$5 = _el$3.firstChild;
        insert(_el$3, createComponent(Show, {
          get when() {
            return item().required;
          },
          get children() {
            return _tmpl$2$1();
          }
        }), _el$5);
        insert(_el$5, () => item().label);
        insert(_el$2, createComponent(Dynamic, {
          get component() {
            return item().component;
          },
          get defaultValue() {
            return item().initialValue;
          },
          onChange: value => {
            set(values, item().name, value);
          }
        }), null);
        effect(_p$ => {
          const _v$ = cs('ant-flex ant-items-center ant-mb-16px', item().class),
            _v$2 = item().style;
          _v$ !== _p$._v$ && className(_el$2, _p$._v$ = _v$);
          _p$._v$2 = style(_el$2, _v$2, _p$._v$2);
          return _p$;
        }, {
          _v$: undefined,
          _v$2: undefined
        });
        return _el$2;
      })()
    }), null);
    insert(_el$, () => props.submit?.(formInstance), null);
    return _el$;
  })();
}
Form.Item = props => props;
Form.createForm = () => {};

const _tmpl$$2 = /*#__PURE__*/template(`<button><div>`);
const Switch = props => {
  const [checked, setChecked] = createControllableValue(props, {
    defaultValuePropName: 'defaultChecked',
    valuePropName: 'checked'
  });
  return (() => {
    const _el$ = _tmpl$$2(),
      _el$2 = _el$.firstChild;
    _el$.$$click = () => setChecked(c => !c);
    effect(_p$ => {
      const _v$ = cs('ant-w-44px ant-h-22px ant-rounded-100px ant-relative', checked() ? 'ant-bg-[var(--primary-color)]' : 'ant-bg-[rgba(0,0,0,0.45)]'),
        _v$2 = cs('ant-w-18px ant-h-18px ant-rounded-50% ant-bg-white ant-absolute ant-top-1/2 -ant-translate-y-1/2 ant-transition-left', checked() ? 'ant-left-[calc(100%-20px)]' : 'ant-left-2px');
      _v$ !== _p$._v$ && className(_el$, _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && className(_el$2, _p$._v$2 = _v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });
    return _el$;
  })();
};
delegateEvents(["click"]);

const _Skeleton = replaceClassName(reactToSolidComponent(Skeleton$1));
const Image$1 = replaceClassName(reactToSolidComponent(Skeleton$1.Image));
const Skeleton = _Skeleton;
Skeleton.Image = Image$1;

const _tmpl$$1 = /*#__PURE__*/template(`<div class="ant-absolute ant-inset-0 ant-flex ant-items-center ant-justify-center ant-bg-[rgba(255,255,255,.5)]"><span class="i-ant-design:loading keyframes-spin ant-[animation:spin_1s_linear_infinite] ant-text-32px ant-text-[var(--primary-color)]">`),
  _tmpl$2 = /*#__PURE__*/template(`<div class="ant-relative ant-min-h-32px">`);
const Spin = props => {
  return (() => {
    const _el$ = _tmpl$2();
    insert(_el$, () => props.children, null);
    insert(_el$, createComponent(Show, {
      get when() {
        return props.spinning;
      },
      get children() {
        return _tmpl$$1();
      }
    }), null);
    return _el$;
  })();
};

const _tmpl$ = /*#__PURE__*/template(`<div class="ant-inline-flex">`);
const _Image = replaceClassName(reactToSolidComponent(configProvider(Image$2), () => _tmpl$()));
function Image(_props) {
  const props = createMemo(() => mapValues(_props, (value, key) => {
    switch (key) {
      case 'placeholder':
        return solidToReact(value);
      default:
        return value;
    }
  }));
  return createComponent(_Image, mergeProps$1(props));
}

export { Button, ColorPicker, DatePicker, Form, Image, Input, InputNumber, Modal, Popconfirm, Popover, Progress, Radio, Result, Select, Skeleton, Spin, Switch, Tabs, Timeline, Tooltip, Tree, Upload };
