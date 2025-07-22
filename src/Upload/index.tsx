import { nanoid } from 'nanoid'
import { type Component, mergeProps, type ParentProps, createSignal, type Signal } from 'solid-js'

interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number
}

export interface UploadRequestOption<T = any> {
  file: File
  onProgress?: (event: UploadProgressEvent) => void
  onError?: (event: Error) => void
  onSuccess?: (body: T) => void
}

export interface UploadFile<T = any> {
  /**
   * 文件唯一标识
   */
  id: string
  /**
   * 文件名
   */
  name: string
  /**
   * MIME 类型
   */
  type?: string
  /**
   * 文件大小
   */
  size?: number
  file?: File
  response?: T
  status?: 'pending' | 'uploading' | 'error' | 'finished'
  percent?: number
  /**
   * 下载地址
   */
  url?: string
}

export interface UploadProps<T = any> extends ParentProps {
  class?: string
  accept?: string
  /**
   * 上传的地址
   */
  action?: string
  /**
   * 上传请求的 http method
   * 默认 'post'
   */
  method?: string
  customRequest?: (option: UploadRequestOption<T>) => void
  onAdd?: (fileList: Array<Signal<T>>) => void
  multiple?: boolean
}

/**
 * 根据一个 File 对象创建一个 UploadFile 对象
 * @param file
 * @returns
 */
function createUploadFile(file: File): UploadFile {
  const id = `upload-${nanoid()}`
  return {
    id,
    file,
    name: file.name,
    type: file.type,
    size: file.size,
    status: 'pending',
    percent: 0,
  }
}

async function request<T = any>(
  uploadFileSignal: Signal<UploadFile<T>>,
  customRequest: UploadProps['customRequest'],
) {
  const [uploadFile, setUploadFile] = uploadFileSignal
  const { file } = uploadFile()
  if (!file) return await Promise.reject(new Error('file is required'))

  return await new Promise<UploadFile<T>>((resolve, reject) => {
    customRequest?.({
      file,
      onProgress(event) {
        setUploadFile(value => ({
          ...value,
          status: 'uploading',
          percent: event.percent ?? 0,
        }))
      },
      onSuccess(response) {
        const newValue = setUploadFile(value => ({ ...value, status: 'finished', response }))
        resolve(newValue)
      },
      onError(err) {
        setUploadFile(value => ({ ...value, status: 'error' }))
        reject(err)
      },
    })
  })
}

const Upload: Component<UploadProps> & {
  request: typeof request
  createUploadFile: typeof createUploadFile
} = _props => {
  let input: HTMLInputElement | undefined
  const props = mergeProps(
    {
      customRequest: ({ file, onSuccess, onError }) => {
        if (!_props.action) return

        const formData = new FormData()
        formData.append('file', file)
        fetch(_props.action, {
          method: _props.method ?? 'post',
          body: formData,
        })
          .then(onSuccess)
          .catch(onError)
      },
    } as UploadProps,
    _props,
  )

  return (
    <span class={props.class} onClick={() => input?.click()}>
      {props.children}

      <input
        ref={input}
        class="hidden"
        type="file"
        accept={props.accept}
        multiple={props.multiple}
        onInput={e => {
          const fileList: Array<Signal<UploadFile>> = []
          for (const file of Array.from(e.target.files ?? [])) {
            // eslint-disable-next-line solid/reactivity
            const uploadFileSignal = createSignal(createUploadFile(file))
            request(uploadFileSignal, props.customRequest)
            fileList.push(uploadFileSignal)
          }

          props.onAdd?.(fileList)
          e.target.value = ''
        }}
      />
    </span>
  )
}

Upload.request = request
Upload.createUploadFile = createUploadFile

export default Upload
