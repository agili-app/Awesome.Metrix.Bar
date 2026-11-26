import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@ui-sdk/react/file-input";

function Example() {
  return (
    <FileInput name="attachments" multiple>
      <FileInputDropzone>
        <p>Drag and drop files here</p>
        <FileInputTrigger>Browse Files</FileInputTrigger>
      </FileInputDropzone>
      <FileInputList aria-label="Files">
        <FileInputItem>
          {({ file }) => (
            <>
              <span>{file.name}</span>
              <span>{formatFileSize(file.size)}</span>
              <FileInputItemRemove aria-label={`Remove ${file.name}`} />
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  );
}

export { Example };
