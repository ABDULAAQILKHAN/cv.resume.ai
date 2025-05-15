
"use client";

import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod'; // Not needed here
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle, User, Briefcase, GraduationCap, Wand2, AlignLeft, Award, Smile, BadgeCheck, Lightbulb } from 'lucide-react';
import type { ExtractResumeDataOutput } from '@/types/resume';
// import { ExtractResumeDataOutputSchema } from '@/types/resume'; // Not needed here

interface ResumeFormProps {
  form: UseFormReturn<ExtractResumeDataOutput>;
  onSubmit: (values: ExtractResumeDataOutput) => void;
  isSubmitting?: boolean;
}

export function ResumeForm({ form, onSubmit, isSubmitting }: ResumeFormProps) {
  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({
    control: form.control,
    name: "achievements",
  });
  
  const {
    fields: hobbyFields,
    append: appendHobby,
    remove: removeHobby,
  } = useFieldArray({
    control: form.control,
    name: "hobbies",
  });

  const addStringArrayItem = (appendFn: Function) => {
    // @ts-ignore Zod expects string for these arrays, react-hook-form useFieldArray wraps it in object with id
    appendFn({ value: '' });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="personalDetails.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalDetails.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g. jane.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalDetails.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. (123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalDetails.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. linkedin.com/in/janedoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignLeft className="h-6 w-6 text-primary" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief overview of your career, skills, and goals." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" /> Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {experienceFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g. Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="e.g. Tech Solutions Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM-DD or Jan 2020" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date (Optional)</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM-DD or Present" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your responsibilities and achievements." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeExperience(index)} className="mt-4"><Trash2 className="mr-2 h-4 w-4" /> Remove Experience</Button>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => appendExperience({ title: '', company: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
          </CardContent>
        </Card>
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projectFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <FormField control={form.control} name={`projects.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="e.g. Personal Portfolio Website" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`projects.${index}.link`} render={({ field }) => (<FormItem><FormLabel>Link (Optional)</FormLabel><FormControl><Input placeholder="e.g. github.com/user/project" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`projects.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date (Optional)</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`projects.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date (Optional)</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM or Ongoing" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the project, your role, and technologies used." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeProject(index)} className="mt-4"><Trash2 className="mr-2 h-4 w-4" /> Remove Project</Button>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => appendProject({ title: '', link: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {educationFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="e.g. University of Example" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="e.g. B.S. in Computer Science" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`education.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM-DD or Aug 2016" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`education.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM-DD or May 2020" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`education.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="e.g. Relevant coursework, achievements" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeEducation(index)} className="mt-4"><Trash2 className="mr-2 h-4 w-4" /> Remove Education</Button>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => appendEducation({ institution: '', degree: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" /> Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField control={form.control} name={`skills.${index}.value`} render={({ field }) => ( /* @ts-ignore */
                    <FormItem className="flex-grow"><FormControl><Input placeholder="e.g. JavaScript" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addStringArrayItem(appendSkill)}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill</Button>
          </CardContent>
        </Card>

        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-6 w-6 text-primary" /> Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {certificationFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="space-y-4">
                  <FormField control={form.control} name={`certifications.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Certification Title</FormLabel><FormControl><Input placeholder="e.g. Certified Cloud Practitioner" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`certifications.${index}.link`} render={({ field }) => (<FormItem><FormLabel>Link (Optional)</FormLabel><FormControl><Input placeholder="e.g. Credly Badge URL" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`certifications.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Issue Date (Optional)</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`certifications.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>Expiry Date (Optional)</FormLabel><FormControl><Input placeholder="e.g. YYYY-MM or N/A" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`certifications.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Briefly describe the certification." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeCertification(index)} className="mt-4"><Trash2 className="mr-2 h-4 w-4" /> Remove Certification</Button>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => appendCertification({ title: '', link: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Certification</Button>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievementFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField control={form.control} name={`achievements.${index}.value`} render={({ field }) => ( /* @ts-ignore */
                    <FormItem className="flex-grow"><FormControl><Input placeholder="e.g. Employee of the Month" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAchievement(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addStringArrayItem(appendAchievement)}><PlusCircle className="mr-2 h-4 w-4" /> Add Achievement</Button>
          </CardContent>
        </Card>
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-6 w-6 text-primary" /> Hobbies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hobbyFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField control={form.control} name={`hobbies.${index}.value`} render={({ field }) => ( /* @ts-ignore */
                    <FormItem className="flex-grow"><FormControl><Input placeholder="e.g. Hiking" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeHobby(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addStringArrayItem(appendHobby)}><PlusCircle className="mr-2 h-4 w-4" /> Add Hobby</Button>
          </CardContent>
        </Card>
        
      </form>
    </Form>
  );
}
