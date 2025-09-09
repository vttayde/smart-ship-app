import Layout from '@/components/layout/Layout';

export default function TestPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Hydration Test Page
                        </h1>
                        <p className="text-gray-600 mb-4">
                            This page is used to test hydration fixes. If you see this page without
                            hydration errors in the console, the fix is working correctly.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <p className="text-green-800">
                                ✅ If the header navigation appears correctly and there are no hydration
                                errors in the browser console, the fix is successful.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
