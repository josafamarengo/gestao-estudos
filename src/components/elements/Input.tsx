export const Input = () => {
  return (
      <div>
          <label htmlFor="UserEmail" className="block text-xs font-medium text-gray-700"> Email </label>
          <input
              type="email"
              id="UserEmail"
              placeholder="john@rhcp.com"
              className="mt-1 w-full rounded-md border-gray-200 shadow-xs sm:text-sm"
          />
      </div>
  )
}
