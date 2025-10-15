"use client";
import Trainer from '../../../components/Trainer';
import type { UUID } from '../../../db/types';
import { use, useEffect, useState } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { db } from '../../../db';
import type { CardSet } from '../../../db/types';

export default function StudySetPage({ params, searchParams }: { params: Promise<{ setId: string }>; searchParams: Promise<{ restart?: string }> }) {
  const resolvedParams = use(params);
  const sp = use(searchParams);
  const forceAll = sp?.restart === '1';
  const [set, setSet] = useState<CardSet | null>(null);

  useEffect(() => {
    async function loadSet() {
      const s = await db.sets.get(resolvedParams.setId);
      setSet(s ?? null);
    }
    loadSet();
  }, [resolvedParams.setId]);

  return (
    <div className="mx-auto pt-[72px] max-w-[1280px] flex flex-col gap-6">
      <Breadcrumbs />
      
      {/* Title */}
      <div className="flex items-center justify-between mt-1">
        <h1 className="m-0">Study {set?.name || ''}</h1>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <Trainer scope={{ setId: resolvedParams.setId as unknown as UUID }} forceAll={forceAll} />
      </div>
    </div>
  );
}


