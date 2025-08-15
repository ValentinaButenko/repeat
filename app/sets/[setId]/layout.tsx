export default function SetLayout({ children, modals }: { children: React.ReactNode; modals: React.ReactNode }) {
  return (
    <>
      {children}
      {modals}
    </>
  );
}


