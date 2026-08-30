import type { Session } from '@supabase/supabase-js';
import SocialDashboard from './SocialDashboard';

type DashboardProps = {
  session: Session;
  onSignOut: () => void;
  initialRoomId?: string;
};

export default function Dashboard({ session, onSignOut, initialRoomId }: DashboardProps) {
  return <SocialDashboard session={session} onSignOut={onSignOut} initialRoomId={initialRoomId} />;
}
