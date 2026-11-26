import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";

function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList aria-label="Settings">
        <TabsTab value="account">Account</TabsTab>
        <TabsTab value="password">Password</TabsTab>
      </TabsList>
      <TabsPanel value="account">Manage your profile.</TabsPanel>
      <TabsPanel value="password">Choose a new password.</TabsPanel>
    </Tabs>
  );
}

export { Example };
