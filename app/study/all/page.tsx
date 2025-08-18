import Trainer from '../../../components/Trainer';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function StudyAllPage({ searchParams }: { searchParams: { restart?: string } }) {
  const forceAll = searchParams?.restart === '1';
  return (
    <div className="mx-auto p-6 max-w-[800px]">
      <Breadcrumbs />
      <Trainer scope={{ all: true }} forceAll={forceAll} />
    </div>
  );
}


