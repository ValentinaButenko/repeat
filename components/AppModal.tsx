"use client";
import Modal from './Modal';

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

// Reusable app-styled modal based on the Edit Card modal visuals
export default function AppModal({ title, children, className }: Props) {
  // p-8 = 32px padding on all sides, matching required inner margins
  const base = "rounded-xl w-full max-w-[720px] h-[540px] overflow-auto bg-[#F6F4F0] p-8";
  return (
    <Modal
      title={title}
      className={(className ? className + " " : "") + base}
      titleClassName="text-[#1C1D17]"
      titleStyle={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 24, color: '#1C1D17' }}
    >
      {children}
    </Modal>
  );
}


