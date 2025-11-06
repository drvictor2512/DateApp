import { Redirect } from 'expo-router';

// Start app at the Auth flow. You can
// replace this Redirect with your own landing UI if needed.
export default function Index() {
  return <Redirect href="/auth" />;
}

