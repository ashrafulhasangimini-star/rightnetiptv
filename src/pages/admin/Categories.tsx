import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from "@/hooks/useCategories";
import { toast } from "sonner";

const Categories = () => {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
    is_active: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      description: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || "",
      description: category.description || "",
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...formData });
    } else {
      createCategory.mutate(formData);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত এই ক্যাটাগরি মুছে ফেলতে চান?")) {
      deleteCategory.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">ক্যাটাগরি ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">চ্যানেলের ক্যাটাগরি সমূহ ({categories?.length || 0}টি)</p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          নতুন ক্যাটাগরি
        </Button>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="glass-card-hover p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon || "📁"}</span>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description || "কোনো বিবরণ নেই"}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      category.is_active 
                        ? "bg-success/20 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">কোনো ক্যাটাগরি নেই। নতুন ক্যাটাগরি যোগ করুন।</p>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md mx-4 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">
                {editingCategory ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি"}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ক্যাটাগরির নাম</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: সংবাদ, খেলাধুলা"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">আইকন (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📺"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">বিবরণ</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">সর্ট অর্ডার</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="flex-1 gap-2"
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  {(createCategory.isPending || updateCategory.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
