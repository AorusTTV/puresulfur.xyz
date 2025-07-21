
export const DiagnosticsInstructions = () => {
  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h4 className="font-medium mb-2">🎯 צעדים לתיקון המחירים</h4>
      <div className="text-sm text-green-700 space-y-1">
        <div>1. 🔍 לחץ על "נתח וצור SQL לתיקון" כדי לזהות בעיות</div>
        <div>2. 📋 העתק את ה-SQL שנוצר והפעל אותו ב-Supabase</div>
        <div>3. 🧪 לחץ על "בדוק עדכון מחירים" כדי לוודא שהתיקון עבד</div>
        <div>4. 🏪 רענן את העמוד /store כדי לראות את המחירים המתוקנים</div>
      </div>
    </div>
  );
};
