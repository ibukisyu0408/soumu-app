import Link from "next/link";

const categories = [
  {
    title: "物件管理",
    description: "物件情報の管理・検索",
    href: "#",
    enabled: false,
    icon: "🏢",
  },
  {
    title: "駐車場管理",
    description: "駐車場・駐車枠の管理",
    href: "/parking",
    enabled: true,
    icon: "🅿️",
  },
  {
    title: "車両管理",
    description: "車両情報の管理・検索",
    href: "#",
    enabled: false,
    icon: "🚗",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">総務管理システム</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.title} className="relative">
            {cat.enabled ? (
              <Link
                href={cat.href}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h2 className="text-lg font-semibold mb-1">{cat.title}</h2>
                <p className="text-sm text-gray-600">{cat.description}</p>
              </Link>
            ) : (
              <div className="block p-6 bg-gray-50 rounded-lg border border-gray-200 opacity-60 cursor-not-allowed">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h2 className="text-lg font-semibold mb-1">{cat.title}</h2>
                <p className="text-sm text-gray-600">{cat.description}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded">
                  準備中
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
