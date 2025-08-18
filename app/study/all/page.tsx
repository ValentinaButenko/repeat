import Trainer from '../../../components/Trainer';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useSearchParams } from 'next/navigation';

export default function StudyAllPage() {
  const search = useSearchParams();
  const forceAll = search.get('restart') === '1';
  return (
    <div className="mx-auto p-6 max-w-[800px]">
      <Breadcrumbs />
      <Trainer scope={{ all: true }} forceAll={forceAll} />
    </div>
  );
}


