const MainLayout = ({children} : {children: preact.ComponentChildren}) => {
  return (
    <main className="container absolute">
        {children}
    </main>
  )
}

export default MainLayout