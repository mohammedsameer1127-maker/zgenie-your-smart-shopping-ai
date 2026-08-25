import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "User Profile — ZGenie" }],
  }),
  component: ProfileRouteComponent,
});

function ProfileRouteComponent() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

function ProfilePage() {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const user = currentUser;
    
    let isMounted = true;
    async function fetchUserProfile() {
      try {
        setIsFetching(true);
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (isMounted) {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || user.displayName || "");
          } else {
            setName(user.displayName || "");
          }
        }
      } catch (err) {
        console.error("Error fetching user profile from Firestore:", err);
        if (isMounted) {
          setName(user.displayName || "");
        }
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    fetchUserProfile();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Full name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, { name: trimmedName }, { merge: true });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile in Firestore:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarLetter = (
    name.trim() ? name.trim()[0] : (currentUser?.email ? currentUser.email[0] : "U")
  ).toUpperCase();

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold">
            <User className="mr-1.5 h-3.5 w-3.5" /> Account Details
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            User Profile Overview
          </h1>
        </div>

        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4 border-b border-border/60 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-black text-2xl shadow-md">
              {avatarLetter}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {name || currentUser?.displayName || "Active Member Account"}
              </h2>
              <p className="text-xs text-muted-foreground">{currentUser?.email || "Smart Shopping AI Enabled"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isFetching ? "Loading..." : "Enter your full name"}
                disabled={isFetching || isSaving}
                className="h-10 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Email Address</Label>
              <Input
                value={currentUser?.email || ""}
                readOnly
                disabled
                className="h-10 rounded-xl text-xs bg-muted/50 cursor-not-allowed text-muted-foreground"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isFetching || isSaving}
            className="rounded-full font-bold text-xs h-10 px-5 gap-1.5 mt-4"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Profile Changes
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}

