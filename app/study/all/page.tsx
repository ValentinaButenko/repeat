import Trainer from '../../../components/Trainer';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { use } from 'react';

export default function StudyAllPage({ searchParams }: { searchParams: Promise<{ restart?: string }> }) {
  const sp = use(searchParams);
  const forceAll = sp?.restart === '1';
  return (
    <div className="mx-auto pt-[72px] max-w-[1280px]">
      <Breadcrumbs />
      <div className="mt-6">
        <Trainer scope={{ all: true }} forceAll={forceAll} />
      </div>
    </div>
  );
}


