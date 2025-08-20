import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";

interface PasswordPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryName: string;
  onVerifyPassword: (password: string) => Promise<boolean>;
}

export const PasswordPromptDialog = ({
  isOpen,
  onClose,
  onSuccess,
  categoryName,
  onVerifyPassword
}: PasswordPromptDialogProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    setIsVerifying(true);
    
    try {
      const isValid = await onVerifyPassword(password);
      
      if (isValid) {
        toast.success("Access granted!");
        setPassword("");
        onSuccess();
      } else {
        toast.error("Incorrect password");
        setPassword("");
      }
    } catch (error) {
      toast.error("Failed to verify password");
      console.error("Password verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Lock className="w-5 h-5 text-yellow-400" />
            Protected Category
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            The category <span className="font-semibold text-white">"{categoryName}"</span> is password protected.
            Please enter the password to access its content.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-gray-800 border-gray-600 text-white pr-10"
                  disabled={isVerifying}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isVerifying}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isVerifying}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isVerifying || !password.trim()}
            className="bg-white text-black hover:bg-gray-200"
          >
            {isVerifying ? "Verifying..." : "Open"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};