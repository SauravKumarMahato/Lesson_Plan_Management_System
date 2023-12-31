/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/css/*.css",
    "./views/*.ejs",
    "./views/components/*.ejs"
],
  theme: {
    extend: {
      // colors: ({ colors }) => ({
      //   black: colors.black,
      // })
    },
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    }
  ],
}
