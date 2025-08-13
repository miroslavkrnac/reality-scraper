import { redirect } from 'next/navigation';

const HomePage = () => {
	redirect('/realities');
};

// biome-ignore lint/style/noDefaultExport: Next.js requires default export for pages
export default HomePage;
