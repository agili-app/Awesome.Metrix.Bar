import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";

function Example() {
  return (
    <Select placeholder="Select a role">
      <SelectLabel>Role</SelectLabel>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="viewer">Viewer</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
      </SelectContent>
    </Select>
  );
}

export { Example };
