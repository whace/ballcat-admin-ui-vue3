﻿import { Space } from 'ant-design-vue'

import type { ActionType, ProColumns } from '../typing'
import { useContainer } from '../container'
import { isMergeCell } from '.'
import type { VueNode } from '#/types'
import type { ProFieldEmptyText } from '#/field'
import type { ProSchemaComponentTypes, ProTableEditableFnType } from '#/utils/typing'
import LabelIconTip from '#/utils/components/LabelIconTip'
import get from 'ant-design-vue/es/vc-util/get'
import { genCopyable } from '#/utils/genCopyable'

/** 转化列的定义 */
type ColumnRenderInterface<T> = {
  columnProps: ProColumns<T>
  text: any
  rowData: T
  index: number
  columnEmptyText?: ProFieldEmptyText
  type: ProSchemaComponentTypes
  counter: ReturnType<typeof useContainer>
  editableUtils: any
  subName: string[]
}

/**
 * 增加了 icon 的功能 render title
 *
 * @param item
 */
export const renderColumnsTitle = (item: ProColumns<any>) => {
  const { title } = item
  if (title && typeof title === 'function') {
    return title(item, 'table', <LabelIconTip label={null} tooltip={item.tooltip || item.tip} />)
  }
  return <LabelIconTip label={title} tooltip={item.tooltip || item.tip} ellipsis={item.ellipsis} />
}

/** 判断可不可编辑 */
function isEditableCell<T>(
  text: any,
  rowData: T,
  index: number,
  editable?: ProTableEditableFnType<T> | boolean
) {
  if (typeof editable === 'boolean') {
    return !editable
  }
  return editable?.(text, rowData, index) === false
}

/**
 * 默认的 filter 方法
 *
 * @param value
 * @param record
 * @param dataIndex
 * @returns
 */
export const defaultOnFilter = (value: string, record: any, dataIndex: string | string[]) => {
  const recordElement = Array.isArray(dataIndex)
    ? get(record, dataIndex as string[])
    : record[dataIndex]
  const itemValue = String(recordElement) as string

  return String(itemValue) === String(value)
}

// class OptionsCell extends React.Component<{
//   children: (form: ProFormInstance) => React.ReactNode
//   record: any
//   form: ProFormInstance
// }> {
//   shouldComponentUpdate(nextProps: any) {
//     const { children, ...restProps } = this.props
//     const { children: nextChildren, ...restNextProps } = nextProps
//     return !isDeepEqualReact(restProps, restNextProps)
//   }
//   render() {
//     return <Space>{this.props.children(this.props.form)}</Space>
//   }
// }
/**
 * 这个组件负责单元格的具体渲染
 *
 * @param param0
 */
export function columnRender<T>({
  columnProps,
  text,
  rowData,
  index,
  columnEmptyText,
  type,
  subName,
  editableUtils
}: ColumnRenderInterface<T>): any {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { actionRef, prefixName } = useContainer()!
  const { isEditable, recordKey } = editableUtils.isEditable({ ...rowData, index })
  const { renderText = (val: any) => val } = columnProps

  const renderTextStr = renderText(text, rowData, index, actionRef.value as ActionType)
  const mode =
    isEditable && !isEditableCell(text, rowData, index, columnProps?.editable) ? 'edit' : 'read'

  const textDom = renderTextStr
  // const textDom = cellRenderToFromItem<T>({
  //   text: renderTextStr,
  //   valueType: (columnProps.valueType as ProFieldValueType) || 'text',
  //   index,
  //   rowData,
  //   subName,
  //   columnProps: {
  //     ...columnProps,
  //     // 为了兼容性，原来写了个错别字
  //     // @ts-ignore
  //     entry: rowData,
  //     entity: rowData
  //   },
  //   counter,
  //   columnEmptyText,
  //   type,
  //   recordKey,
  //   mode,
  //   prefixName,
  //   editableUtils
  // })

  const dom: VueNode = mode === 'edit' ? textDom : genCopyable(textDom, columnProps, renderTextStr)

  // /** 如果是编辑模式，并且 renderFormItem 存在直接走 renderFormItem */
  // if (mode === 'edit') {
  //   if (columnProps.valueType === 'option') {
  //     return (
  //       <OptionsCell record={rowData} form={editableForm!}>
  //         {inform => {
  //           return editableUtils.actionRender(
  //             {
  //               ...rowData,
  //               index: columnProps.index || index
  //             },
  //             inform!
  //           )
  //         }}
  //       </OptionsCell>
  //     )
  //   }
  //   return dom
  // }
  //
  // if (!columnProps.render) {
  //   const isReactRenderNode = React.isValidElement(dom) || ['string', 'number'].includes(typeof dom)
  //   return !isNil(dom) && isReactRenderNode ? dom : null
  // }

  const renderDom = columnProps.render?.(
    dom,
    rowData,
    index,
    {
      ...(actionRef.value as ActionType),
      ...editableUtils
    },
    {
      ...columnProps,
      isEditable,
      type: 'table'
    }
  )

  // 如果是合并单元格的，直接返回对象
  if (isMergeCell(renderDom)) {
    return renderDom
  }

  if (renderDom && columnProps.valueType === 'option' && Array.isArray(renderDom)) {
    return <Space size={16}>{renderDom}</Space>
  }
  return renderDom as VueNode
}