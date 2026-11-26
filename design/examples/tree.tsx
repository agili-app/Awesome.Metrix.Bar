import { Tree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from "@ui-sdk/react/tree";

function Example() {
  return (
    <Tree aria-label="Project files">
      <TreeItem value="src">
        <TreeItemLabel>
          <TreeItemIndicator />
          src
        </TreeItemLabel>
        <TreeGroup>
          <TreeItem value="src/index.ts">
            <TreeItemLabel>index.ts</TreeItemLabel>
          </TreeItem>
        </TreeGroup>
      </TreeItem>
      <TreeItem value="package.json">
        <TreeItemLabel>package.json</TreeItemLabel>
      </TreeItem>
    </Tree>
  );
}

export { Example };
