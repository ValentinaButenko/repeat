import Trainer from '../../../components/Trainer';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function StudyAllPage() {
  return (
    <div className="mx-auto p-6 max-w-[800px]">
      <Breadcrumbs />
      <Trainer scope={{ all: true }} />
    </div>
  );
}


