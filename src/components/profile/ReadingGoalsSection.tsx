import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Target, Plus, Calendar, BookOpen, MoreHorizontal, BookPlus, Trash } from "lucide-react";
import { ReadingGoal } from "../../types/profile";

interface ReadingGoalsSectionProps {
    theme: string;
    goals: ReadingGoal[];
    setShowGoalModal: (show: boolean) => void;
    handleAddBooksToGoal: (goal: ReadingGoal) => void;
    handleDeleteGoal: (id: string) => void;
}

export const ReadingGoalsSection: React.FC<ReadingGoalsSectionProps> = ({
    theme,
    goals,
    setShowGoalModal,
    handleAddBooksToGoal,
    handleDeleteGoal
}) => {
    return (
        <Card className={`border ${theme === 'dark' ? 'border-blue-900/30 shadow-lg shadow-blue-500/10 bg-slate-900/90' : 'border-blue-300/30 shadow-lg shadow-blue-500/5 bg-white/90'} backdrop-blur`}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Reading Goals</CardTitle>
                    <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Track your reading progress and challenges</CardDescription>
                </div>
                <Button onClick={() => setShowGoalModal(true)} className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                </Button>
            </CardHeader>
            <CardContent>
                {goals.length > 0 ? (
                    <div className="space-y-6">
                        {goals.map((goal) => (
                            <div
                                key={goal.id}
                                className={`p-4 rounded-lg border ${theme === 'dark'
                                    ? 'border-slate-700 bg-slate-800/50'
                                    : 'border-slate-200 bg-slate-50'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{goal.title}</h3>
                                        {goal.description && (
                                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{goal.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {goal.deadline ? `Due ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline'}
                                            </span>
                                            <span className="flex items-center">
                                                <BookOpen className="h-3 w-3 mr-1" />
                                                {goal.completed_books} / {goal.target_books} books
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAddBooksToGoal(goal)}>
                                                <BookPlus className="h-4 w-4 mr-2" />
                                                Add Books
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => handleDeleteGoal(goal.id)}
                                            >
                                                <Trash className="h-4 w-4 mr-2" />
                                                Delete Goal
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                                        <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                                            {Math.round((goal.completed_books / goal.target_books) * 100)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={(goal.completed_books / goal.target_books) * 100}
                                        className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`p-8 text-center rounded-lg border ${theme === 'dark'
                        ? 'border-slate-800 bg-slate-800/20'
                        : 'border-slate-200 bg-slate-100/20'}`}>
                        <Target className={`h-10 w-10 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No reading goals yet</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Create a goal to challenge yourself
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
