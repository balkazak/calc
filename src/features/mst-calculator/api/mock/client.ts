// this is mock for if calculator is Cabinet = true
export const fetchUserData = async () => {
  return new Promise<{ tel: string; email: string; iin: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        tel: '+7 777 111 22 33',
        email: 'mock@example.com',
        iin: '900101400200',
      })
    }, 500) // Simulate delay
  })
}
