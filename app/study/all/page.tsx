import Trainer from '../../../components/Trainer';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function StudyAllPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Breadcrumbs />
      <Trainer scope={{ all: true }} />
    </div>
  );
}


