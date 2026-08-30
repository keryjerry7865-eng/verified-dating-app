import type { Session } from '@supabase/supabase-js';
import SocialDashboard from './SocialDashboard';

type DashboardProps = {
  session: Session;
  onSignOut: () => void;
};

export default function Dashboard({ session, onSignOut }: DashboardProps) {
  return <SocialDashboard session={session} onSignOut={onSignOut} />;
}
