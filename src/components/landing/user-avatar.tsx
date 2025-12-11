import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

const UserAvatar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials =
    user.user_metadata?.full_name?.[0]?.toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer h-9 w-9 shadow-md">
          <AvatarImage src={user.user_metadata?.avatar_url} alt="User avatar" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 bg-background/95 backdrop-blur-lg shadow-xl border-border/40"
      >
     

        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings" className="cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer gap-2 
             bg-red-600 text-white 
             hover:bg-red-700 hover:text-white 
             focus:bg-red-700 focus:text-white 
             active:bg-red-800"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
