"use client";
import Trainer from '../../../components/Trainer';
import type { UUID } from '../../../db/types';
import { use } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function StudySetPage({ params, searchParams }: { params: { setId: string }; searchParams: Promise<{ restart?: string }> }) {
  const sp = use(searchParams);
  const forceAll = sp?.restart === '1';
  return (
    <div className="mx-auto p-6 max-w-[800px]">
      <Breadcrumbs />
      <Trainer scope={{ setId: params.setId as unknown as UUID }} forceAll={forceAll} />
    </div>
  );
}


