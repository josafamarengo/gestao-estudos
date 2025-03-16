const MainLayout = ({children} : {children: preact.ComponentChildren}) => {
  return (
    <main className="main-container absolute">
        {children}
    </main>
  )
}

export default MainLayout