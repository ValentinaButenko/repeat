import Trainer from '../../../components/Trainer';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { use } from 'react';

export default function StudyAllPage({ searchParams }: { searchParams: Promise<{ restart?: string }> }) {
  const sp = use(searchParams);
  const forceAll = sp?.restart === '1';
  return (
    <div className="mx-auto p-6 max-w-[800px]">
      <Breadcrumbs />
      <Trainer scope={{ all: true }} forceAll={forceAll} />
    </div>
  );
}


