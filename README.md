<h3 align="center" >A Movie Application</h3>

<div align="center">
  <br />
      <img src="public/hero.png" alt="Project Banner">
    </a>
  <br />
  
  <div>
    <img src="https://img.shields.io/badge/-React_JS-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="react.js" />
    <img src="https://img.shields.io/badge/-Appwrite-black?style=for-the-badge&logoColor=white&logo=appwrite&color=FD366E" alt="appwrite" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
  </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🗄️ [Appwrite Setup](#appwrite-setup)
6. 🚀 [Deployment](#deployment)
7. 🌐 [Working Site](#working-site)


## <a name="introduction">🤖 Introduction</a>

Built with React.js for the user interface, Appwrite for backend services and authentication, and styled with TailwindCSS, this Movie App lets logged-in users browse trending movies, search titles, and explore content using the TMDB API. It features a responsive layout and a sleek, modern design.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Appwrite](https://appwrite.io/)** is an open-source Backend-as-a-Service (BaaS) platform that provides developers with a set of APIs to manage authentication, databases, storage, and more, enabling rapid development of secure and scalable applications.

- **[React.js](https://react.dev/reference/react)** is a JavaScript library developed by Meta for building user interfaces. It allows developers to create reusable UI components that manage their own state, leading to more efficient and predictable code. React is widely used for developing single-page applications (SPAs) due to its virtual DOM that improves performance and ease of maintenance.

- **[React-use](https://github.com/streamich/react-use)** is a collection of essential React hooks that simplify common tasks like managing state, side effects, and lifecycle events, promoting cleaner and more maintainable code in React applications.

- **[Tailwind CSS](https://tailwindcss.com/)** is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing custom CSS, enabling rapid and responsive UI development.

- **[Vite](https://vite.dev/)** is a modern build tool that provides a fast development environment for frontend projects. It offers features like hot module replacement (HMR) and optimized builds, enhancing the development experience and performance.

- **[TMDB API](https://developer.themoviedb.org/reference/intro/getting-started)** provides the movie data: posters, ratings, search results, trending lists and external IDs.

- **[Vercel](https://vercel.com/)** hosts the live site and redeploys automatically on every push to GitHub.


## <a name="features">🔋 Features</a>

👉 **Browse All Movies**: Explore a wide range of movies available on the platform.

👉 **Search Movies**: Easily search for specific movies using a debounced search box that avoids unnecessary API calls.

👉 **No Results & Suggestions**: When a search finds nothing, the app shows a "No results found" message and suggests similar or popular movies instead.

👉 **Trending Movies Algorithm**: Displays the top 5 trending movies based on how often each movie is searched, stored in Appwrite. Each movie has a single entry, so the list never repeats a movie. The trending section hides while the user is searching.

👉 **IMDb Links**: Clicking a movie card opens that movie's IMDb page in a new tab (falls back to the TMDB page if no IMDb ID exists).

👉 **Authentication**: Login and signup with email and password using Appwrite Auth, with the session kept after a page refresh.

👉 **Show / Hide Password**: An eye icon on the password fields to reveal or hide what you type.

👉 **Forgot Password**: Email reset link sent through Appwrite, with a "Set new password" screen when the link is opened.

👉 **Profile Menu**: A profile icon at the top right showing the user's name, email and join date, with the Logout button inside it.

👉 **Movie Poster Login Page**: The login page has a wall of this week's trending movie posters as its background.

👉 **Modern UI/UX**: A sleek and user-friendly interface designed for a great experience.

👉 **Responsiveness**: Fully responsive design that works seamlessly across devices.

and many more, including code architecture and reusability

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/Hardik8369/my-first-react-app.git
cd my-first-react-app

```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env.local` in the root of your project and add the following content:

```env
VITE_TMDB_API_KEY=

VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_COLLECTION_ID=
```

Replace the placeholder values with your actual **[TheMovieDatabase API](https://developer.themoviedb.org/reference/intro/getting-started)** and **[Appwrite](https://apwr.dev/JSM050)** credentials. For `VITE_TMDB_API_KEY`, use the **API Read Access Token** from your TMDB account.

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## <a name="appwrite-setup">🗄️ Appwrite Setup</a>

1. Create a project in the [Appwrite Console](https://cloud.appwrite.io/) and copy its **Project ID**.
2. Under **Apps**, add a **Web** app with the hostname `localhost`. When you deploy, add your live hostname too (for example `*.vercel.app`), or Appwrite will block requests with a CORS error.
3. Create a database (TablesDB) and copy its **Database ID**.
4. Create a table named `metrics` and copy its ID (used as `VITE_APPWRITE_COLLECTION_ID`).
5. Add these columns to the table:

| Key | Type | Size | Required |
|---|---|---|---|
| `searchTerm` | string | 255 | yes |
| `count` | integer | n/a | yes |
| `poster_url` | string | 255 | no |
| `movie_id` | integer | n/a | yes |

6. In the table's **Security** tab, add the role **Any** with Create, Read, Update and Delete permissions.
7. Make sure **Auth → Settings** has **Email/Password** enabled (it is on by default).

## <a name="deployment">🚀 Deployment</a>

The site is deployed on Vercel:

1. Push the project to GitHub.
2. In Vercel, click **Add New → Project** and import the repository. The Vite preset is detected automatically.
3. Add the four environment variables from `.env.local` (`VITE_TMDB_API_KEY`, `VITE_APPWRITE_PROJECT_ID`, `VITE_APPWRITE_DATABASE_ID`, `VITE_APPWRITE_COLLECTION_ID`).
4. Click **Deploy**. Every later `git push` redeploys the site automatically.

## <a name="working-site">🌐 Working Site</a>

Complete working site: [https://my-first-react-app-virid-six.vercel.app/](https://my-first-react-app-virid-six.vercel.app/)