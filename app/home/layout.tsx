export default function HomeLayout({ children, modals }: { children: React.ReactNode; modals: React.ReactNode }) {
  return (
    <>
      {children}
      {modals}
    </>
  );
}


