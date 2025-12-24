export default function RecentActivities({ activities }: { activities: any[] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-10 text-green-700">
          Recent Activities
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-gray-900">{activity.title}</h3>
              <p className="text-gray-600 mt-2">{activity.subtitle}</p>
              <p className="text-sm text-gray-400 mt-3">
                {new Date(activity.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
