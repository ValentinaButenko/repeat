"use client";
import Trainer from '../../../components/Trainer';
import type { UUID } from '../../../db/types';
import { useParams } from 'next/navigation';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function StudySetPage({ searchParams }: { searchParams: { restart?: string } }) {
  const params = useParams<{ setId: string }>();
  const forceAll = searchParams?.restart === '1';
  return (
    <div className="mx-auto p-6 max-w-[800px]">
      <Breadcrumbs />
      <Trainer scope={{ setId: params.setId as unknown as UUID }} forceAll={forceAll} />
    </div>
  );
}


